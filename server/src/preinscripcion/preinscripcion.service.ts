import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Preinscripcion } from './preinscripcion.entity';
import { CreatePreinscripcionDto } from './dto/create-preinscripcion.dto';
import { Aspirante } from '../aspirante/aspirante.entity';
import { ConstanciaService } from '../constancia/constancia.service';
import { UpdatePreinscripcionDto } from './dto/update-preinscripcion.dto';


@Injectable()
export class PreinscripcionService {
  constructor(
    @InjectRepository(Preinscripcion)
    private readonly preinscripcionRepository: Repository<Preinscripcion>,

    @InjectRepository(Aspirante)
    private readonly aspiranteRepository: Repository<Aspirante>,
    private readonly constanciaService: ConstanciaService,
  ) {}

  async create(
    createPreinscripcionDto: CreatePreinscripcionDto,
  ): Promise<Preinscripcion> {
    const preinscripcion = this.preinscripcionRepository.create({
      ...createPreinscripcionDto,
      estado: 'pendiente',
      fecha_preinscripcion: new Date(),
    });

    const saved = await this.preinscripcionRepository.save(preinscripcion);

    // Obtener el aspirante relacionado
    const aspirante = await this.aspiranteRepository.findOne({
      where: { id: createPreinscripcionDto.aspirante_id },
    });
    if (!aspirante) {
      throw new Error('Aspirante no encontrado para enviar constancia.');
    }
    const data = {
      nombre: aspirante.nombre,
      apellido: aspirante.apellido,
      dni: aspirante.dni,
      email: aspirante.email,
      numeroRegistro: aspirante.id.toString(),
      fechaPreinscripcion: saved.fecha_preinscripcion
        .toISOString()
        .split('T')[0],
    };
    const pdf = await this.constanciaService.generarPDF(data);
    await this.constanciaService.enviarEmailConPDF(pdf, aspirante.email);

    return saved;
  }

  async update(
  id: number,
  updatePreinscripcionDto: UpdatePreinscripcionDto
) {
  const preinscripcion = await this.preinscripcionRepository.findOne({ where: { id }, relations: ['aspirante'] });

  if (!preinscripcion) {
    throw new NotFoundException(`No se encontró la preinscripción con ID ${id}`);
  }

  const estadoAnterior = preinscripcion.estado; // Guardamos el estado anterior

  // Actualizamos la preinscripción
  const updated = this.preinscripcionRepository.merge(preinscripcion, updatePreinscripcionDto);
  const saved = await this.preinscripcionRepository.save(updated);

  // Enviar email solo si el estado cambió y el aspirante tiene email
  if (
    saved.estado !== estadoAnterior &&
    preinscripcion.aspirante?.email
  ) {
    try {
      await this.constanciaService.enviarNotificacionEstado(
        preinscripcion.aspirante.email,
        `${preinscripcion.aspirante.nombre} ${preinscripcion.aspirante.apellido}`,
        saved.estado
      );
    } catch (error) {
      console.error('Error al enviar email de cambio de estado:', error);
    }
  }

  return saved;
}
  async findAllWithAspirante() {
    return this.preinscripcionRepository.find({
      relations: ['aspirante', 'carrera'],
    });
  }
}
