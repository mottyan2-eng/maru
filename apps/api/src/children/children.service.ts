import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Role } from '../shared/role.enum';
import { CreateChildDto } from './dto/create-child.dto';

@Injectable()
export class ChildrenService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const children = await this.prisma.child.findMany({
      include: {
        guardians: {
          include: {
            guardian: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return children.map((child) => ({
      id: child.id,
      firstName: child.firstName,
      lastName: child.lastName,
      birthDate: child.birthDate,
      createdAt: child.createdAt,
      guardians: child.guardians.map(({ guardian }) => ({
        id: guardian.id,
        name: guardian.name,
        email: guardian.email,
        phone: guardian.phone
      }))
    }));
  }

  async create(createChildDto: CreateChildDto, role: Role) {
    const guardians = createChildDto.guardians ?? [];
    const child = await this.prisma.child.create({
      data: {
        firstName: createChildDto.firstName,
        lastName: createChildDto.lastName,
        birthDate: new Date(createChildDto.birthDate),
        guardians: guardians.length
          ? {
              create: guardians.map((guardian) => ({
                guardian: {
                  create: {
                    name: guardian.name,
                    email: guardian.email,
                    phone: guardian.phone
                  }
                }
              }))
            }
          : undefined
      },
      include: {
        guardians: {
          include: {
            guardian: true
          }
        }
      }
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'child.create',
        actorRole: role,
        details: {
          childId: child.id,
          guardianCount: guardians.length
        }
      }
    });

    return {
      id: child.id,
      firstName: child.firstName,
      lastName: child.lastName,
      birthDate: child.birthDate,
      createdAt: child.createdAt,
      guardians: child.guardians.map(({ guardian }) => ({
        id: guardian.id,
        name: guardian.name,
        email: guardian.email,
        phone: guardian.phone
      }))
    };
  }
}
