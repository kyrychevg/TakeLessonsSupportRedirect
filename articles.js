const axios = require('axios');
const { formatDocsName } = require('./utils');

class Articles {
    baseUrl = 'https://docs.microsoft.com/takelessons';
    categories;

    getAll = async () => {
        console.log('=================== START FETCHING ===================');

        this.categories = {};

        await this.fetchCategories();
        await this.fetchSections(0);

        const categories = Object.values(this.categories);

        for (const category of categories) {
            await this.fetchArticles(category.id, 0);
        }

        console.log('=================== FINISH FETCHING ===================');
    }

    fetchCategories = async () => {
        const response = await axios('https://takelessons.zendesk.com/api/v2/help_center/en-us/categories')

        this.categories = response.data.categories.reduce((acc , category) => {
            acc[category.id] = {
                id: category.id,
                name: category.name,
                sections: {}
            };

            return acc;
        }, {});
    }

    fetchSections = async (page) => {
        const response = await axios(`https://takelessons.zendesk.com/api/v2/help_center/en-us/sections?page=${page}&per_page=100`)

        response.data.sections.forEach(section => {
            if (this.categories[section.category_id]) {
                this.categories[section.category_id].sections[section.id] = {
                    name: section.name,
                    categoryId: section.category_id,
                    articles: {}
                }
            }
        })

        if (response.data.next_page) {
            await this.fetchSections(response.data.page + 1);
        }
    }

    fetchArticles = async (categoryId, page) => {
        const response = await axios.get(`https://takelessons.zendesk.com/api/v2/help_center/en-us/categories/${categoryId}/articles?page=${page}&per_page=100`);

        response.data.articles.forEach(article => {
            if (this.categories[categoryId].sections[article.section_id]) {
                this.categories[categoryId].sections[article.section_id].articles[article.id] = {
                    id: article.id,
                    name: article.name,
                    sectionId: article.section_id,
                    categoryId,
                }
            }
        });

        if (response.data.next_page) {
            await this.fetchArticles(categoryId, response.data.page + 1);
        }
    }

    findEntityUrl = (url) => {
        const entityId = url.split('/').pop().split('-').shift();

        if (url.includes('/categories/')) {
            const categoryName = formatDocsName(this.categories[entityId]?.name);

            if (!categoryName) {
                return this.baseUrl;
            }

            return `${this.baseUrl}/${categoryName}`;
        } else if (url.includes('/sections/')) {
            let categoryName = '';
            let sectionName = '';
            const categoryValues = Object.values(this.categories);

            for (const category of categoryValues) {
                if (category.sections[entityId]?.name) {
                    categoryName = formatDocsName(category.name);
                    sectionName = formatDocsName(category.sections[entityId].name);

                    break;
                }
            }

            if (!categoryName || !sectionName) {
                return this.baseUrl;
            }

            return `${this.baseUrl}/${categoryName}/${sectionName}`;
        } else if (url.includes('/articles/')) {
            let categoryName = '';
            let sectionName = '';
            let articleName = ''
            const categoryValues = Object.values(this.categories);

            for (const category of categoryValues) {
                const sectionValues = Object.values(category.sections);

                for (const section of sectionValues) {
                    if (section.articles[entityId]?.name) {
                        categoryName = formatDocsName(category.name);
                        sectionName = formatDocsName(section.name);
                        articleName = formatDocsName(section.articles[entityId].name);

                        break;
                    }
                }
            }

            if (!categoryName || !sectionName || !articleName) {
                return this.baseUrl;
            }

            return `${this.baseUrl}/${categoryName}/${sectionName}/${articleName}`;
        } else {
            return this.baseUrl;
        }
    }
}

module.exports = {
    Articles
};