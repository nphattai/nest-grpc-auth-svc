import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  LoginRequestDto,
  RegisterRequestDto,
  ValidateRequestDto,
} from './auth.dto';
import {
  AUTH_SERVICE_NAME,
  LoginResponse,
  RegisterResponse,
  ValidateResponse,
} from './auth.pb';
import { AuthService } from './service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'Register')
  async register(payload: RegisterRequestDto): Promise<RegisterResponse> {
    return this.authService.register({
      email: payload.email,
      password: payload.password,
    });
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'Login')
  async login(payload: LoginRequestDto): Promise<LoginResponse> {
    return this.authService.login({
      email: payload.email,
      password: payload.password,
    });
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'Validate')
  async validate(payload: ValidateRequestDto): Promise<ValidateResponse> {
    console.log({ payload });
    return this.authService.validate({
      token: payload.token,
    });
  }
}
