import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    findOne(email: string): Promise<User | undefined>;
    findById(id: string): Promise<User | undefined>;
    create(userData: Partial<User>): Promise<User>;
}
