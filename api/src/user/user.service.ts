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

    const users = await this.prisma.user.findMany({ select: userSelect });
    return { message: 'Users fetched successfully', users };
  }
  //localhost:3000/user/0e9a3ff4-7af6-486b-a378-daff0a68b910
  async getUserById(loggedInId: string, id: string) {
    const role = await this.checkRole(loggedInId);

    if (loggedInId !== id && role !== 'ADMIN') {
      throw new UnauthorizedException(
        'You are not authorized to access this resource',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
    return { message: 'User fetched successfully', user };
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

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: userSelect,
    });
    return { message: 'User updated successfully', user };
  }

  async deleteUser(loggedInId: string, id: string) {
    const role = await this.checkRole(loggedInId);

    if (loggedInId !== id && role !== 'ADMIN') {
      throw new UnauthorizedException(
        'You are not authorized to access this resource',
      );
    }

    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }
}
