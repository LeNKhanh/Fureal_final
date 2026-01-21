import { Request } from 'express';
import { GoogleAuthDto } from '../dto/google-auth.dto';

export interface RequestWithGoogleUser extends Request {
  user: GoogleAuthDto;
}
