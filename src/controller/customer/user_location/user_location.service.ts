// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Not, Repository } from 'typeorm';
import { User_location } from 'src/schema/user_location.schema';
import CommonService from 'src/common/common.util';
import { CommonMessages } from 'src/common/common-messages';

@Injectable()
export class UserLocationService {
    constructor(
        @InjectRepository(User_location)
        private readonly UserLocationModel: Repository<User_location>,
    ) { }

    async getAllPages(user_id: any, page: number = 1, pageSize: number = 10, search: string = '') {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            let whereCondition: any = { user_id: user_id };

            if (search) {
                whereCondition.address = Like(`%${search}%`)
            }

            const [pages, count] = await this.UserLocationModel.findAndCount({
                where: whereCondition,
                skip: offset,
                take: limit,
                order: { createdAt: 'ASC' }
            });

            const paginatedData = CommonService.getPagingData({ count, rows: pages }, page, limit);
            return paginatedData;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get UserLocation data
    async getData(id: number) {
        try {
            const UserLocation = await this.UserLocationModel.findOne({ where: { id: id } });

            if (!UserLocation) {
                throw new Error(CommonMessages.notFound("User location"));
            }
            return UserLocation;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get UserLocation data by ID
    async getDatabyid(id: number) {
        try {
            const UserLocation = await this.UserLocationModel.findOne({ where: { id: id } });

            if (!UserLocation) {
                throw new Error(CommonMessages.notFound("User location"));
            }

            return UserLocation;
        } catch (error) {
            throw new Error(error.message);
        }
    }


    
    async createData(data: any) {
        try {
            const userLocations = await this.UserLocationModel.find({ where: { user_id: data.user_id } });
    
            if (userLocations.length >= 10) {
                throw new Error('You can add only a maximum of 10 addresses.');
            }
    
            const newLocation = this.UserLocationModel.create(data);
    
            const savedLocation = await this.UserLocationModel.save(newLocation);
    
            return savedLocation;
        } catch (error) {
            console.error('Error:', error.message);
            throw new Error(
                error.message.includes('maximum of 10 addresses')
                    ? error.message
                    : 'An error occurred while creating the location. Please try again later.'
            );
        }
    }
    
    async updateData(id: number, updateData: any) {
        try {
            if (updateData.default === 1) {
                const currentRecord = await this.UserLocationModel.findOne({ where: { id } });
                if (!currentRecord) {
                    throw new Error("User Location record not found.");
                }
    
                await this.UserLocationModel.update({ user_id: currentRecord.user_id, id: Not(id) }, { default: 0 });
            }
    
            const response = await this.UserLocationModel.update({ id }, updateData);
    
            if (response.affected === 0) {
                throw new Error("User Location data was not updated.");
            }
    
            const updatedRecord = await this.UserLocationModel.findOne({ where: { id } });
    
            return updatedRecord;
    
        } catch (error) {
            throw new Error(error.message);
        }
    }
    

    async deleteData(id: number) {
        try {
            const UserLocation = await this.UserLocationModel.findOne({ where: { id: id } });

            if (!UserLocation) {
                throw new Error(CommonMessages.notFound("User location"));
            }

            await this.UserLocationModel.softDelete(id);
            return UserLocation;
        } catch (error) {
            throw new Error(error.message);
        }
    }

}
