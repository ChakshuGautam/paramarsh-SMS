'use client';

import { useEffect, useState } from 'react';
import { dataProvider } from '../DataProvider';

export default function DebugPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testDataProvider() {
      const tests: any = {};
      
      try {
        // Test getList
        const listResult = await dataProvider.getList('students', {
          pagination: { page: 1, perPage: 10 },
          sort: { field: 'firstName', order: 'ASC' },
          filter: {}
        });
        tests.getList = { success: true, data: listResult };
      } catch (error: any) {
        tests.getList = { success: false, error: error.message };
      }

      try {
        // Get first student for testing getOne
        const listResult = await dataProvider.getList('students', {
          pagination: { page: 1, perPage: 1 },
          sort: {},
          filter: {}
        });
        
        if (listResult.data[0]) {
          const studentId = (listResult.data[0] as any).id;
          
          // Test getOne
          const oneResult = await dataProvider.getOne('students', { id: studentId });
          tests.getOne = { success: true, data: oneResult };
        }
      } catch (error: any) {
        tests.getOne = { success: false, error: error.message };
      }

      try {
        // Test getMany
        const listResult = await dataProvider.getList('students', {
          pagination: { page: 1, perPage: 2 },
          sort: {},
          filter: {}
        });
        
        if (listResult.data.length > 0) {
          const ids = listResult.data.map((item: any) => item.id);
          const manyResult = await dataProvider.getMany('students', { ids });
          tests.getMany = { success: true, data: manyResult };
        }
      } catch (error: any) {
        tests.getMany = { success: false, error: error.message };
      }

      // Test resource mapping
      const resources = ['students', 'classes', 'sections', 'guardians'];
      for (const resource of resources) {
        try {
          const result = await dataProvider.getList(resource, {
            pagination: { page: 1, perPage: 5 },
            sort: {},
            filter: {}
          });
          tests[`resource_${resource}`] = { 
            success: true, 
            count: result.data.length,
            total: result.total,
            hasData: result.data.length > 0
          };
        } catch (error: any) {
          tests[`resource_${resource}`] = { 
            success: false, 
            error: error.message 
          };
        }
      }

      setResults(tests);
      setLoading(false);
    }

    testDataProvider();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">DataProvider Debug</h1>
      
      {loading ? (
        <p>Testing DataProvider methods...</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(results).map(([method, result]: [string, any]) => (
            <div key={method} className="border p-4 rounded">
              <h2 className="font-bold text-lg mb-2">{method}</h2>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">React Admin Expected Format</h2>
        <div className="text-sm space-y-2">
          <p>✅ getList: {`{ data: Array, total: number }`}</p>
          <p>✅ getOne: {`{ data: Object }`}</p>
          <p>✅ getMany: {`{ data: Array }`}</p>
          <p>✅ getManyReference: {`{ data: Array, total: number }`}</p>
          <p>✅ create: {`{ data: Object }`}</p>
          <p>✅ update: {`{ data: Object }`}</p>
          <p>✅ delete: {`{ data: Object }`}</p>
        </div>
      </div>
    </div>
  );
}