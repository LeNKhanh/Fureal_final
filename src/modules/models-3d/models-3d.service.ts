import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { Model3D } from './entities/model-3d.entity';
import { CreateModel3DDto } from './dto/create-model-3d.dto';
import { UpdateModel3DDto } from './dto/update-model-3d.dto';
import { FilterModel3DDto } from './dto/filter-model-3d.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class Models3DService {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(
    @InjectRepository(Model3D)
    private modelRepository: Repository<Model3D>,
    private configService: ConfigService,
    private auditLogsService: AuditLogsService,
  ) {
    const accountId = this.configService.get<string>('r2.accountId');
    this.bucket = this.configService.get<string>('r2.bucketName');
    this.publicUrl = this.configService.get<string>('r2.publicUrl');

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.get<string>('r2.accessKeyId'),
        secretAccessKey: this.configService.get<string>('r2.secretAccessKey'),
      },
    });
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────

  async create(dto: CreateModel3DDto, userId: string): Promise<Model3D> {
    const model = this.modelRepository.create({
      ...dto,
      createdById: userId,
    });
    const saved = await this.modelRepository.save(model);

    await this.auditLogsService.log(
      userId,
      'CREATE_MODEL_3D',
      `Model3D: ${saved.name} (ID: ${saved.id})`,
    );

    return saved;
  }

  async findAll(filter: FilterModel3DDto): Promise<PaginatedResult<Model3D>> {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      isActive,
      fileFormat,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filter;

    const skip = (page - 1) * limit;
    const qb = this.modelRepository
      .createQueryBuilder('model')
      .leftJoinAndSelect('model.createdBy', 'createdBy');

    if (search) {
      qb.andWhere('(model.name LIKE :s OR model.description LIKE :s)', { s: `%${search}%` });
    }
    if (category) {
      qb.andWhere('model.category = :category', { category });
    }
    if (isActive !== undefined) {
      qb.andWhere('model.isActive = :isActive', { isActive });
    }
    if (fileFormat) {
      qb.andWhere('model.fileFormat = :fileFormat', { fileFormat });
    }

    const allowedSort = ['name', 'createdAt', 'fileSize'];
    const orderCol = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(`model.${orderCol}`, sortOrder).skip(skip).take(limit);

    const [data, totalItems] = await qb.getManyAndCount();
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<Model3D> {
    const model = await this.modelRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!model) throw new NotFoundException(`Model 3D with ID "${id}" not found`);
    return model;
  }

  async update(id: string, dto: UpdateModel3DDto, userId: string): Promise<Model3D> {
    const model = await this.findOne(id);
    Object.assign(model, dto);
    const saved = await this.modelRepository.save(model);

    await this.auditLogsService.log(
      userId,
      'UPDATE_MODEL_3D',
      `Model3D: ${saved.name} (ID: ${saved.id})`,
    );

    return saved;
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const model = await this.findOne(id);

    // Remove file from R2 if it's an R2 URL
    if (model.modelUrl && model.modelUrl.includes(this.publicUrl)) {
      const key = model.modelUrl.replace(`${this.publicUrl}/`, '');
      await this.deleteFromR2(key).catch(() => null); // non-blocking
    }
    if (model.thumbnailUrl && model.thumbnailUrl.includes(this.publicUrl)) {
      const key = model.thumbnailUrl.replace(`${this.publicUrl}/`, '');
      await this.deleteFromR2(key).catch(() => null);
    }

    await this.modelRepository.remove(model);

    await this.auditLogsService.log(
      userId,
      'DELETE_MODEL_3D',
      `Model3D: ${model.name} (ID: ${id})`,
    );

    return { message: `Model 3D "${model.name}" deleted successfully` };
  }

  // ─── R2 Upload ───────────────────────────────────────────────────────────

  /**
   * Tạo presigned URL để FE upload thẳng lên R2
   */
  async getPresignedUploadUrl(
    fileName: string,
    contentType: string,
    folder: 'models' | 'thumbnails' = 'models',
  ): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const key = `${folder}/${uuidv4()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 600 }); // 10 min

    return {
      uploadUrl,
      publicUrl: `${this.publicUrl}/${key}`,
      key,
    };
  }

  /**
   * Upload file Buffer trực tiếp (cho multipart upload từ backend)
   */
  async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    contentType: string,
    folder: 'models' | 'thumbnails' = 'models',
  ): Promise<{ url: string; key: string }> {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const key = `${folder}/${uuidv4()}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return { url: `${this.publicUrl}/${key}`, key };
  }

  private async deleteFromR2(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
