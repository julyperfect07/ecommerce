import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/currentuser.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
@UseGuards(JwtGuard) // 👈 applied to all routes
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getAllUsers(@CurrentUser('id') userId: string) {
    return this.userService.getAllUsers(userId);
  }

  @Get(':id')
  getUserById(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.userService.getUserById(userId, id);
  }

  @Patch(':id')
  updateUser(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(userId, id, updateUserDto);
  }

  @Delete(':id')
  deleteUser(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.userService.deleteUser(userId, id);
  }
}
