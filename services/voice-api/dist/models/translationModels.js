"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationDatabaseService = void 0;
class TranslationDatabaseService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTranslationUsage(usageData) {
        return await this.prisma.translationUsage.create({
            data: {
                call_control_id: usageData.call_control_id,
                customer_id: usageData.customer_id,
                source_language: usageData.source_language,
                target_language: usageData.target_language,
                original_text: usageData.original_text,
                translated_text: usageData.translated_text,
                processing_time_ms: usageData.processing_time_ms,
                cost: usageData.cost,
                tier: usageData.tier,
                created_at: usageData.created_at || new Date()
            }
        });
    }
    async getTranslationUsage(customerId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [translations, total] = await Promise.all([
            this.prisma.translationUsage.findMany({
                where: { customer_id: customerId },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            this.prisma.translationUsage.count({
                where: { customer_id: customerId }
            })
        ]);
        return {
            translations,
            total,
            pages: Math.ceil(total / limit)
        };
    }
    async getTranslationUsageByCall(callControlId) {
        return await this.prisma.translationUsage.findMany({
            where: { call_control_id: callControlId },
            orderBy: { created_at: 'asc' }
        });
    }
    async getTranslationUsageByDateRange(customerId, startDate, endDate) {
        return await this.prisma.translationUsage.findMany({
            where: {
                customer_id: customerId,
                created_at: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }
    async createCustomerTranslationStats(statsData) {
        return await this.prisma.customerTranslationStats.create({
            data: {
                customer_id: statsData.customer_id,
                total_translations: statsData.total_translations || 0,
                total_cost: statsData.total_cost || 0,
                last_translation_at: statsData.last_translation_at || new Date(),
                created_at: statsData.created_at || new Date(),
                updated_at: statsData.updated_at || new Date()
            }
        });
    }
    async updateCustomerTranslationStats(customerId, updateData) {
        return await this.prisma.customerTranslationStats.upsert({
            where: { customer_id: customerId },
            update: {
                total_translations: updateData.total_translations,
                total_cost: updateData.total_cost,
                last_translation_at: updateData.last_translation_at,
                updated_at: new Date()
            },
            create: {
                customer_id: customerId,
                total_translations: updateData.total_translations || 0,
                total_cost: updateData.total_cost || 0,
                last_translation_at: updateData.last_translation_at || new Date(),
                created_at: new Date(),
                updated_at: new Date()
            }
        });
    }
    async getCustomerTranslationStats(customerId) {
        return await this.prisma.customerTranslationStats.findUnique({
            where: { customer_id: customerId }
        });
    }
    async incrementCustomerTranslationStats(customerId, cost) {
        return await this.prisma.customerTranslationStats.upsert({
            where: { customer_id: customerId },
            update: {
                total_translations: { increment: 1 },
                total_cost: { increment: cost },
                last_translation_at: new Date(),
                updated_at: new Date()
            },
            create: {
                customer_id: customerId,
                total_translations: 1,
                total_cost: cost,
                last_translation_at: new Date(),
                created_at: new Date(),
                updated_at: new Date()
            }
        });
    }
    async createTranslationConfig(configData) {
        return await this.prisma.translationConfig.create({
            data: {
                customer_id: configData.customer_id,
                default_source_language: configData.default_source_language || 'en',
                default_target_language: configData.default_target_language || 'en',
                auto_detect_language: configData.auto_detect_language ?? true,
                enabled: configData.enabled ?? true,
                created_at: configData.created_at || new Date(),
                updated_at: configData.updated_at || new Date()
            }
        });
    }
    async updateTranslationConfig(customerId, updateData) {
        return await this.prisma.translationConfig.upsert({
            where: { customer_id: customerId },
            update: {
                default_source_language: updateData.default_source_language,
                default_target_language: updateData.default_target_language,
                auto_detect_language: updateData.auto_detect_language,
                enabled: updateData.enabled,
                updated_at: new Date()
            },
            create: {
                customer_id: customerId,
                default_source_language: updateData.default_source_language || 'en',
                default_target_language: updateData.default_target_language || 'en',
                auto_detect_language: updateData.auto_detect_language ?? true,
                enabled: updateData.enabled ?? true,
                created_at: new Date(),
                updated_at: new Date()
            }
        });
    }
    async getTranslationConfig(customerId) {
        return await this.prisma.translationConfig.findUnique({
            where: { customer_id: customerId }
        });
    }
    async deleteTranslationConfig(customerId) {
        await this.prisma.translationConfig.delete({
            where: { customer_id: customerId }
        });
    }
    async getTranslationMetrics(customerId) {
        const whereClause = customerId ? { customer_id: customerId } : {};
        const [totalTranslations, totalCost, averageProcessingTime, languageDistribution, costByTier, translationsToday, translationsThisMonth, topLanguagePairs] = await Promise.all([
            this.getTotalTranslations(whereClause),
            this.getTotalCost(whereClause),
            this.getAverageProcessingTime(whereClause),
            this.getLanguageDistribution(whereClause),
            this.getCostByTier(whereClause),
            this.getTranslationsToday(whereClause),
            this.getTranslationsThisMonth(whereClause),
            this.getTopLanguagePairs(whereClause)
        ]);
        return {
            totalTranslations,
            totalCost,
            averageProcessingTime,
            languageDistribution,
            costByTier,
            translationsToday,
            translationsThisMonth,
            topLanguagePairs
        };
    }
    async getTotalTranslations(whereClause) {
        return await this.prisma.translationUsage.count({
            where: whereClause
        });
    }
    async getTotalCost(whereClause) {
        const result = await this.prisma.translationUsage.aggregate({
            where: whereClause,
            _sum: { cost: true }
        });
        return result._sum.cost || 0;
    }
    async getAverageProcessingTime(whereClause) {
        const result = await this.prisma.translationUsage.aggregate({
            where: whereClause,
            _avg: { processing_time_ms: true }
        });
        return result._avg.processing_time_ms || 0;
    }
    async getLanguageDistribution(whereClause) {
        const results = await this.prisma.translationUsage.groupBy({
            by: ['target_language'],
            where: whereClause,
            _count: { target_language: true }
        });
        const distribution = {};
        results.forEach((result) => {
            distribution[result.target_language] = result._count.target_language;
        });
        return distribution;
    }
    async getCostByTier(whereClause) {
        const results = await this.prisma.translationUsage.groupBy({
            by: ['tier'],
            where: whereClause,
            _sum: { cost: true }
        });
        const costByTier = {};
        results.forEach((result) => {
            costByTier[result.tier] = result._sum.cost || 0;
        });
        return costByTier;
    }
    async getTranslationsToday(whereClause) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return await this.prisma.translationUsage.count({
            where: {
                ...whereClause,
                created_at: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });
    }
    async getTranslationsThisMonth(whereClause) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        return await this.prisma.translationUsage.count({
            where: {
                ...whereClause,
                created_at: {
                    gte: startOfMonth
                }
            }
        });
    }
    async getTopLanguagePairs(whereClause) {
        const results = await this.prisma.translationUsage.groupBy({
            by: ['source_language', 'target_language'],
            where: whereClause,
            _count: { source_language: true }
        });
        return results
            .map((result) => ({
            pair: `${result.source_language} → ${result.target_language}`,
            count: result._count.source_language
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
    async getCustomerTranslationCosts(customerId, startDate, endDate) {
        const translations = await this.prisma.translationUsage.findMany({
            where: {
                customer_id: customerId,
                created_at: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });
        const totalCost = translations.reduce((sum, translation) => sum + translation.cost, 0);
        const translationCount = translations.length;
        const averageCost = translationCount > 0 ? totalCost / translationCount : 0;
        return {
            totalCost,
            translationCount,
            averageCost
        };
    }
    async getTranslationCostsByTier(startDate, endDate) {
        const results = await this.prisma.translationUsage.groupBy({
            by: ['tier'],
            where: {
                created_at: {
                    gte: startDate,
                    lte: endDate
                }
            },
            _sum: { cost: true },
            _count: { tier: true }
        });
        const costsByTier = {};
        results.forEach((result) => {
            costsByTier[result.tier] = {
                totalCost: result._sum.cost || 0,
                translationCount: result._count.tier
            };
        });
        return costsByTier;
    }
    async cleanupOldTranslationData(daysOld = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const result = await this.prisma.translationUsage.deleteMany({
            where: {
                created_at: { lt: cutoffDate }
            }
        });
        return result.count;
    }
    async exportTranslationData(customerId, startDate, endDate) {
        return await this.prisma.translationUsage.findMany({
            where: {
                customer_id: customerId,
                created_at: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }
    getTranslationPricing() {
        return [
            {
                tier: 'basic',
                telnyx_cost_per_minute: 0.07,
                markup_per_minute: 0,
                total_cost_per_minute: 0,
                currency: 'USD',
                features: ['No translation access']
            },
            {
                tier: 'premium',
                telnyx_cost_per_minute: 0.07,
                markup_per_minute: 1.00,
                total_cost_per_minute: 1.07,
                currency: 'USD',
                features: [
                    'Real-time translation',
                    '50+ languages',
                    'Speech-to-text',
                    'Text-to-speech',
                    'Language detection'
                ]
            },
            {
                tier: 'enterprise',
                telnyx_cost_per_minute: 0.07,
                markup_per_minute: 1.00,
                total_cost_per_minute: 1.07,
                currency: 'USD',
                features: [
                    'Real-time translation',
                    '50+ languages',
                    'Speech-to-text',
                    'Text-to-speech',
                    'Language detection',
                    'Custom models',
                    'Priority support',
                    'SLA guarantees'
                ]
            }
        ];
    }
}
exports.TranslationDatabaseService = TranslationDatabaseService;
//# sourceMappingURL=translationModels.js.map