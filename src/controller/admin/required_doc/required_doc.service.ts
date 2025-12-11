// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Required_doc } from '../../../schema/required_doc.schema';
import CommonService from 'src/common/common.util';
import { CommonMessages } from 'src/common/common-messages';
import * as moment from 'moment-timezone';

@Injectable()
export class Required_docService {
    constructor(
        @InjectRepository(Required_doc)
        private readonly Required_docModel: Repository<Required_doc>,
    ) { }

    // Get a list of Required_docs
    async getList() {
        try {
            const Required_docs = await this.Required_docModel.find({
                where: { is_active: true }, order: { createdAt: 'DESC' }
            });

            if (!Required_docs || Required_docs.length === 0) {
                throw new Error(CommonMessages.notFound('Document'));
            }

            return Required_docs;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get all Required_docs with pagination and search
    async getAllPages(
        page: number = 1,
        pageSize: number = 10,
        search: string = '',
        is_active: any
    ) {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);
    
            // Create a query builder
            const queryBuilder = this.Required_docModel.createQueryBuilder('required_doc')
                .skip(offset)
                .take(limit)
                .orderBy('required_doc.createdAt', 'DESC');
    
            // Add search condition for both `title` and `ar_title` with collation
            if (search) {
                queryBuilder.andWhere(
                    '(required_doc.title LIKE :search COLLATE utf8mb4_general_ci OR required_doc.ar_title LIKE :search COLLATE utf8mb4_general_ci)',
                    { search: `%${search}%` }
                );
            } 
    
            // Add is_active condition if specified
            if (is_active && is_active === 'true') {
                queryBuilder.andWhere('required_doc.is_active = :is_active', { is_active: true });
            }
    
            // Execute query and get result with count
            const [pages, count] = await queryBuilder.getManyAndCount();
    
            // Prepare paginated response
            const paginatedData = CommonService.getPagingData({ count, rows: pages }, page, limit);
            return paginatedData;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    

    // Get Required_doc data by ID
    async getbyid(id: number) {
        try {
            const requiredDoc = await this.Required_docModel.findOne({ where: { id } });

            // Parse custom_fields if it exists and is a string
            if (requiredDoc?.custom_fields && typeof requiredDoc.custom_fields === 'string') {
                requiredDoc.custom_fields = JSON.parse(requiredDoc.custom_fields);
            }

            return requiredDoc;
        } catch (error) {
            throw new Error(error.message);
        }
    }


    // Create Required_doc data
    async createData(data: any) {
        try {
            // Ensure `custom_fields` is in JSON format
            if (data.custom_fields && typeof data.custom_fields !== 'string') {
                data.custom_fields = JSON.stringify(data.custom_fields);
            }
    
            // Set the createdAt field to the current time in Saudi Arabia (Riyadh) timezone (GMT+3)
            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');
    
            // Create a new required document with the adjusted time
            let newRequired_doc: any = await this.Required_docModel.create(data);
            newRequired_doc = await this.Required_docModel.save(newRequired_doc);
    
            return newRequired_doc;
        } catch (error) {
            throw new Error(error.message);
        }
    }


    // Update Required_doc data
    async updateData(id: any, updateData: any) {
        try {
            // Ensure `custom_fields` is in JSON format
            if (updateData.custom_fields && typeof updateData.custom_fields !== 'string') {
                updateData.custom_fields = JSON.stringify(updateData.custom_fields);
            }

            const response = await this.Required_docModel.update(id, updateData);
            return response;
        } catch (error) {
            throw new Error(error.message);
        }
    }



    // Delete Required_doc data
    async deleteData(id: number) {
        try {
            const Required_doc = await this.Required_docModel.findOne({ where: { id: id } });

            if (!Required_doc) {
                throw new Error(CommonMessages.notFound('Document'));
            }

            await this.Required_docModel.softDelete(id);
            return Required_doc;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async bulkDeletedata(ids: number[]): Promise<number> {
        try {
            const categories = await this.Required_docModel.find({ where: { id: In(ids) } });

            if (categories.length === 0) {
                throw new Error(CommonMessages.notFound('wallet request'));
            }

            const result = await this.Required_docModel.softDelete(ids);

            return result.affected || 0;
        } catch (error) {
            throw new Error(error.message);
        }
    }

}
