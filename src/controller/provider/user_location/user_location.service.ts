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

    async getAllPages(user_id: any, ) {
        try {

            let whereCondition: any = { user_id: user_id };

            const data= await this.UserLocationModel.findOne({
                where: whereCondition
            });

            return data;
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


    async createOrUpdateData(data: any, user_id: any) {
        try {
             let existingLocation = await this.UserLocationModel.findOne({ where: { user_id: user_id } });
    
             if (existingLocation) {
                existingLocation = { ...existingLocation, ...data };  
                let updatedLocation = await this.UserLocationModel.save(existingLocation);  
                return updatedLocation;
            } else {
                 let response = await this.UserLocationModel.create(data);
                response = await this.UserLocationModel.save(response);
                return response;
            }
        } catch (error) {
            console.error('Error:', error);
            throw new Error(error.message.includes('maximum of 10 addresses') ? error.message : 'An error occurred while creating or updating the location. Please try again later.');
        }
    }

     

}
