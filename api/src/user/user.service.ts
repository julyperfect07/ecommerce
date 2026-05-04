import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private async checkRole(loggedInId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: loggedInId },
      select: { role: true },
    });
    return user?.role;
  }

  async getAllUsers(loggedInId: string) {
    const role = await this.checkRole(loggedInId);

    if (role !== 'ADMIN') {
      throw new UnauthorizedException(
        'You are not authorized to access this resource',
      );
    }

    return this.prisma.user.findMany({ select: userSelect });
  }

  async getUserById(loggedInId: string, id: string) {
    const role = await this.checkRole(loggedInId);

    if (loggedInId !== id && role !== 'ADMIN') {
      throw new UnauthorizedException(
        'You are not authorized to access this resource',
      );
    }

    return this.prisma.user.findUnique({ where: { id }, select: userSelect });
  }

  async updateUser(
    loggedInId: string,
    id: string,
    updateUserDto: UpdateUserDto,
  ) {
    const role = await this.checkRole(loggedInId);

    if (loggedInId !== id && role !== 'ADMIN') {
      throw new UnauthorizedException(
        'You are not authorized to access this resource',
      );
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: userSelect,
    });
  }

  async deleteUser(loggedInId: string, id: string) {
    const role = await this.checkRole(loggedInId);

    if (loggedInId !== id && role !== 'ADMIN') {
      throw new UnauthorizedException(
        'You are not authorized to access this resource',
      );
    }

    return this.prisma.user.delete({ where: { id } });
  }
}
