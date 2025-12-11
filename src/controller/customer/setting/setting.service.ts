// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Setting } from 'src/schema/setting.schema';
import * as bcrypt from 'bcryptjs';
import CommonService from 'src/common/common.util';
import { OptionsMessage } from 'src/common/options';
import { CommonMessages } from 'src/common/common-messages';

@Injectable()
export class SettingService {
    constructor(
        @InjectRepository(Setting)
        private readonly SettingModel: Repository<Setting>,
    ) { }

    async getAllkeys(keys: string[]) {
        try {
            const query: any = {};
            if (keys && keys.length > 0) { query.key = In(keys); }
            const data = await this.SettingModel.find({ where: query });
            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get all settings with pagination and search
    async getAllPages(search: any) {
        try {
            const data = await this.SettingModel.find();
            return data
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get setting data by ID
    async getDatabyid(key: any) {
        try {
            const setting = await this.SettingModel.findOne({ where: { key } });
            if (!setting) {
                throw new Error(CommonMessages.notFound('Setting'));
            }

            return setting;
        } catch (error) {
            throw new Error(error.message);
        }
    }

}
