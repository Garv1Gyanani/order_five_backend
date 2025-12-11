// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Required_doc } from '../../../schema/required_doc.schema';
import CommonService from 'src/common/common.util';
import { CommonMessages } from 'src/common/common-messages';

@Injectable()
export class Required_docService {
    constructor(
        @InjectRepository(Required_doc)
        private readonly Required_docModel: Repository<Required_doc>,
    ) { }

    // Get a list of Required_docs
    async getList() {
        try {
            const Required_docs = await this.Required_docModel.find({ where: { is_active: true } });

            if (!Required_docs || Required_docs.length === 0) {
                throw new Error(CommonMessages.notFound('Document'));
            }

            return Required_docs;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get all Required_docs with pagination and search
    async getAllPages(page: number = 1, pageSize: number = 10, search: string = '') {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);
    
            const [pages, count] = await this.Required_docModel.findAndCount({
                where: { is_active: true, ...(search && { title: Like(`%${search}%`) }) },
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' }
            });
    
            // Parse `custom_fields` for each record
            const parsedPages = pages.map(page => {
                if (page?.custom_fields && typeof page.custom_fields === 'string') {
                    page.custom_fields = JSON.parse(page.custom_fields);
                }
                return page;
            });
    
            const paginatedData = CommonService.getPagingData({ count, rows: parsedPages }, page, limit);
            return paginatedData;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    // Get Required_doc data by ID
    async getbyid(id: number) {
        try {
            const Required_doc = await this.Required_docModel.findOne({ where: { id } });

            return Required_doc;
        } catch (error) {
            return error
        }
    }

}
