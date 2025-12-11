"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = void 0;
const getDatabaseConfig = (configService) => {
    var _a;
    const dbPort = Number((_a = configService.get('DB_PORT')) !== null && _a !== void 0 ? _a : '4000');
    return {
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: dbPort,
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        charset: 'utf8mb4',
        autoLoadEntities: true,
        synchronize: true,
        ssl: {
            rejectUnauthorized: true,
        },
        logging: true,
    };
};
exports.getDatabaseConfig = getDatabaseConfig;
//# sourceMappingURL=db.config.js.map