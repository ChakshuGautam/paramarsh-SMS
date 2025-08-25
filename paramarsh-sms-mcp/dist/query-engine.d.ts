export interface QueryOptions {
    query: string;
    module: 'students' | 'teachers' | 'attendance' | 'invoices' | 'communications' | 'general';
    branchId?: string;
    limit?: number;
}
/**
 * Main query engine that maps natural language to API calls
 */
export declare function queryParamarshSMS(options: QueryOptions): Promise<string>;
//# sourceMappingURL=query-engine.d.ts.map