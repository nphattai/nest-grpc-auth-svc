import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from '../auth.entity';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ValidateRequest,
  ValidateResponse,
} from '../auth.pb';
import { JwtService } from './jwt.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepo: Repository<Auth>,
    private readonly jwtService: JwtService,
  ) {}

  public async register({
    email,
    password,
  }: RegisterRequest): Promise<RegisterResponse> {
    const exitingAuth = await this.authRepo.findOne({ where: { email } });

    if (exitingAuth) {
      return { status: HttpStatus.CONFLICT, error: ['Email already exists'] };
    }

    const auth = new Auth();
    auth.email = email;
    auth.password = this.jwtService.encodePassword(password);

    await this.authRepo.save(auth);

    return { status: HttpStatus.CREATED, error: null };
  }

  public async login({
    email,
    password,
  }: LoginRequest): Promise<LoginResponse> {
    const auth: Auth = await this.authRepo.findOne({ where: { email } });

    if (!auth) {
      return {
        status: HttpStatus.NOT_FOUND,
        error: ['Email not found'],
        token: null,
      };
    }

    const isValidPassword = this.jwtService.isPasswordValid(
      password,
      auth.password,
    );

    if (!isValidPassword) {
      return {
        status: HttpStatus.FORBIDDEN,
        error: ['Invalid password'],
        token: null,
      };
    }

    const token = this.jwtService.generateToken(auth);

    return { status: HttpStatus.OK, token, error: null };
  }

  public async validate({ token }: ValidateRequest): Promise<ValidateResponse> {
    const decoded: Auth = await this.jwtService.verify(token);

    if (!decoded) {
      return {
        status: HttpStatus.FORBIDDEN,
        error: ['Token is invalid'],
        userId: null,
      };
    }

    const auth: Auth = await this.jwtService.validateUser(decoded);

    if (!auth) {
      return {
        status: HttpStatus.CONFLICT,
        error: ['User not found'],
        userId: null,
      };
    }

    return { status: HttpStatus.OK, error: null, userId: decoded.id };
  }
}
