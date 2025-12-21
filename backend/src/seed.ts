import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { UserRole } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);

    const email = 'allan.deschamps@outlook.fr';
    const password = '123456!';
    const name = 'Allan Deschamps';

    // Check if user exists
    const existing = await usersService.findOne(email);
    if (existing) {
        console.log('User already exists:', email);
        await app.close();
        return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await usersService.create({
        email,
        password: hashedPassword,
        name,
        role: UserRole.ADMIN,
    });

    console.log('Admin user created:', user.email);
    await app.close();
}

seed().catch(console.error);
