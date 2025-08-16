import { IsEnum, IsOptional } from 'class-validator';

export class UpdatePreinscripcionDto {
  @IsOptional()
  @IsEnum(['en espera', 'confirmado', 'rechazado'])
  estado?: 'en espera' | 'confirmado' | 'rechazado';
}