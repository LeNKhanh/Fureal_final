import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Models3DService } from './models-3d.service';
import { CreateModel3DDto } from './dto/create-model-3d.dto';
import { UpdateModel3DDto } from './dto/update-model-3d.dto';
import { FilterModel3DDto } from './dto/filter-model-3d.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';

const ALLOWED_3D_FORMATS = ['glb', 'gltf', 'obj', 'fbx'];
const ALLOWED_IMG_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_MODEL_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_THUMB_SIZE = 10 * 1024 * 1024;  // 10MB

@ApiTags('Models 3D')
@Controller('models-3d')
export class Models3DController {
  constructor(private readonly service: Models3DService) {}

  // ─── Public ──────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get all 3D models (public – for /creativespace)' })
  @ApiResponse({ status: 200, description: 'List of 3D models' })
  findAll(@Query() filter: FilterModel3DDto) {
    return this.service.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get 3D model by ID (public)' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // ─── Admin only ───────────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create 3D model entry (Admin only)' })
  create(@Body() dto: CreateModel3DDto, @GetUser() user: any) {
    return this.service.create(dto, user.userId);
  }

  @Post('upload/presign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get presigned R2 URL for direct browser upload (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fileName: { type: 'string', example: 'sofa.glb' },
        contentType: { type: 'string', example: 'model/gltf-binary' },
        folder: { type: 'string', enum: ['models', 'thumbnails'], example: 'models' },
      },
      required: ['fileName', 'contentType'],
    },
  })
  getPresignedUrl(
    @Body() body: { fileName: string; contentType: string; folder?: 'models' | 'thumbnails' },
  ) {
    return this.service.getPresignedUploadUrl(body.fileName, body.contentType, body.folder);
  }

  @Post('upload/direct')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @UseInterceptors(
    FilesInterceptor('files', 2, {
      limits: { fileSize: MAX_MODEL_SIZE },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Direct multipart upload to R2 (Admin only). Field "files": index 0 = model, index 1 = thumbnail (optional)' })
  async uploadDirect(
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) throw new BadRequestException('No files provided');

    const results: { model?: any; thumbnail?: any } = {};

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.originalname.split('.').pop()?.toLowerCase();

      if (i === 0) {
        // Model file
        if (!ALLOWED_3D_FORMATS.includes(ext)) {
          throw new BadRequestException(`Unsupported 3D format: .${ext}. Allowed: ${ALLOWED_3D_FORMATS.join(', ')}`);
        }
        const contentType = ext === 'glb' ? 'model/gltf-binary'
          : ext === 'gltf' ? 'model/gltf+json'
          : ext === 'obj' ? 'model/obj'
          : 'application/octet-stream';

        results.model = await this.service.uploadBuffer(
          file.buffer,
          file.originalname,
          contentType,
          'models',
        );
      } else {
        // Thumbnail
        if (!ALLOWED_IMG_FORMATS.includes(ext)) {
          throw new BadRequestException(`Unsupported thumbnail format: .${ext}`);
        }
        const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
        results.thumbnail = await this.service.uploadBuffer(
          file.buffer,
          file.originalname,
          contentType,
          'thumbnails',
        );
      }
    }

    return results;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update 3D model (Admin only)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateModel3DDto,
    @GetUser() user: any,
  ) {
    return this.service.update(id, dto, user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete 3D model + R2 files (Admin only)' })
  remove(@Param('id') id: string, @GetUser() user: any) {
    return this.service.remove(id, user.userId);
  }
}
