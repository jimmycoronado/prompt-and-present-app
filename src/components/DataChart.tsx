
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  type: 'bar' | 'line' | 'pie';
  data: Array<{ [key: string]: string | number }>;
  xKey?: string;
  yKey?: string;
  nameKey?: string;
  valueKey?: string;
  title?: string;
}

interface DataChartProps {
  chartData: ChartData;
}

export const DataChart: React.FC<DataChartProps> = ({ chartData }) => {
  const { type, data, xKey, yKey, nameKey, valueKey, title } = chartData;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
              <XAxis 
                dataKey={xKey} 
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis className="text-gray-600 dark:text-gray-400" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey={yKey} fill="#3B82F6" />
            </BarChart>
          ) : type === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
              <XAxis 
                dataKey={xKey} 
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis className="text-gray-600 dark:text-gray-400" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={yKey} 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
          ) : type === 'pie' ? (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={valueKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill as string || `hsl(${index * 45}, 70%, 50%)`} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
            </PieChart>
          ) : null}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
