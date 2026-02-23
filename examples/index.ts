import tradingPlatform from './trading-platform.calm.json';
import paymentGateway from './payment-gateway.calm.json';

export interface DemoArchitecture {
  id: string;
  name: string;
  description: string;
  nodeCount: number;
  data: unknown; // Raw JSON, parsed at runtime
}

export const DEMO_ARCHITECTURES: DemoArchitecture[] = [
  {
    id: 'trading-platform',
    name: 'Trading Platform',
    description: 'Multi-service trading system with FIX protocol, order management, and real-time market data',
    nodeCount: 10,
    data: tradingPlatform,
  },
  {
    id: 'payment-gateway',
    name: 'Payment Gateway',
    description: 'PCI-DSS compliant payment processing with tokenization and fraud detection',
    nodeCount: 8,
    data: paymentGateway,
  },
];
