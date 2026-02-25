import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { AuthProvider } from './entities/auth-provider.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AuthProvider)
    private authProviderRepository: Repository<AuthProvider>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, fullName } = registerDto;

    // Check if user exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user with default USER role (roleId: 3)
    const user = this.userRepository.create({
      email,
      passwordHash,
      fullName,
      roleId: 3, // USER role
      isActive: true,
    });

    await this.userRepository.save(user);

    // Remove password from response
    const { passwordHash: _, ...result } = user;
    return {
      message: 'User registered successfully',
      user: result,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user with role
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role?.name || 'USER',
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role?.name,
      },
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getProfile(userId: string) {
    const user = await this.validateUser(userId);
    // Strip sensitive fields before returning
    const { passwordHash, ...result } = user as any;
    return result;
  }

  async googleLogin(googleUser: GoogleAuthDto) {
    const { provider, providerId, email, fullName, picture } = googleUser;

    // Check if user exists with this provider
    let authProvider = await this.authProviderRepository.findOne({
      where: { provider, providerUserId: providerId },
      relations: ['user', 'user.role'],
    });

    let user: User;

    if (authProvider) {
      // User exists, return existing user
      user = authProvider.user;
    } else {
      // Check if user exists with this email
      user = await this.userRepository.findOne({
        where: { email },
        relations: ['role'],
      });

      if (user) {
        // Link Google account to existing user
        authProvider = this.authProviderRepository.create({
          userId: user.id,
          provider,
          providerUserId: providerId,
        });
        await this.authProviderRepository.save(authProvider);
      } else {
        // Create new user
        user = this.userRepository.create({
          email,
          fullName,
          roleId: 3, // USER role
          isActive: true,
          passwordHash: null, // OAuth users don't have password
        });
        await this.userRepository.save(user);

        // Create auth provider record
        authProvider = this.authProviderRepository.create({
          userId: user.id,
          provider,
          providerUserId: providerId,
        });
        await this.authProviderRepository.save(authProvider);

        // Load role for new user
        user = await this.userRepository.findOne({
          where: { id: user.id },
          relations: ['role'],
        });
      }
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role?.name || 'USER',
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role?.name,
      },
    };
  }
}
