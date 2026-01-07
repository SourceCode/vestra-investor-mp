import 'reflect-metadata';
import { DataSource } from 'typeorm';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from './entities/User.entity';
import { Organization } from './entities/Organization.entity';
import { OrganizationMember } from './entities/OrganizationMember.entity';
import { Role } from './entities/Role.entity';
import { Permission } from './entities/Permission.entity';
import { RolePermission } from './entities/RolePermission.entity';
import { InvestorProfile } from './entities/InvestorProfile.entity';
import { Contract } from './entities/Contract.entity';
import { Deal } from './entities/Deal.entity';
import { Media } from './entities/Media.entity';
import { Conversation } from './entities/Conversation.entity';
import { ConversationParticipant } from './entities/ConversationParticipant.entity';
import { Message } from './entities/Message.entity';
import { Notification } from './entities/Notification.entity';
import { Offer } from './entities/Offer.entity';
import { Payment } from './entities/Payment.entity';
import { TransactionStep } from './entities/TransactionStep.entity';
import { SavedSearch } from './entities/SavedSearch.entity';

let _dirname: string;

try {
    const _filename = fileURLToPath(import.meta.url);
    _dirname = path.dirname(_filename);
} catch (e) {
    // Fallback for CommonJS/Jest where import.meta might not be available
    _dirname = __dirname;
}

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5688'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'homify_v1',
    synchronize: process.env.NODE_ENV === 'test',
    logging: process.env.NODE_ENV === 'development',
    entities: [
        User,
        Organization,
        OrganizationMember,
        Role,
        Permission,
        RolePermission,
        InvestorProfile,
        Contract,
        Deal,
        Media,
        Conversation,
        ConversationParticipant,
        Message,
        Notification,
        Offer,
        Payment,
        TransactionStep,
        SavedSearch
    ], // Explicit import avoids glob issues in Jest
    migrations: process.env.NODE_ENV === 'test' ? [] : [path.join(_dirname, 'migrations/**/*.{ts,js}')],
    subscribers: [],
});
