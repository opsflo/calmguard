import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    { type: 'doc', id: 'intro', label: 'Overview' },
    {
      type: 'category',
      label: 'For Users',
      collapsed: false,
      items: ['getting-started', 'uploading-architectures', 'reading-reports'],
    },
    {
      type: 'category',
      label: 'For Developers',
      collapsed: false,
      items: [
        'architecture/system-overview',
        'architecture/agent-system',
        'api/reference',
        'compliance/frameworks',
        'contributing',
        'reviewing',
        'security',
        {
          type: 'category',
          label: 'Architecture Decision Records',
          collapsed: true,
          items: [
            'adrs/ADR-001-yaml-agent-config',
            'adrs/ADR-002-zod-validation',
            'adrs/ADR-003-localstorage-learning-store',
            'adrs/ADR-004-promise-allsettled-orchestration',
            'adrs/ADR-005-multi-provider-llm-registry',
            'adrs/ADR-006-skill-files-as-markdown',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
