import { Controller, Post, Body, Put, Param, ParseIntPipe, NotFoundException, Get } from '@nestjs/common';
import { PreinscripcionService } from './preinscripcion.service';
import { CreatePreinscripcionDto } from './dto/create-preinscripcion.dto';
import { UpdatePreinscripcionDto } from './dto/update-preinscripcion.dto';

@Controller('preinscripcion')
export class PreinscripcionController {
  constructor(private readonly preinscripcionService: PreinscripcionService) {}

  @Post()
  async create(@Body() createPreinscripcionDto: CreatePreinscripcionDto) {
    return this.preinscripcionService.create(createPreinscripcionDto);
  }
  
  @Get()
async findAll() {
  return this.preinscripcionService.findAllWithAspirante();
}
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePreinscripcionDto: UpdatePreinscripcionDto,
  ) {
    const updated = await this.preinscripcionService.update(id, updatePreinscripcionDto);

    if (!updated) {
      throw new NotFoundException('Preinscripción no encontrada');
    }

    return updated;
  }
}

