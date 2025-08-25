"use client";

<<<<<<< HEAD
import { useListContext, useRecordContext } from "ra-core";
import {
  DataTable,
  List,
  Count,
  SelectInput,
} from "@/components/admin";
// Filters temporarily removed for demo compatibility
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mail, Smartphone, Phone, Globe } from "lucide-react";
import { formatDate } from "@/lib/utils/date-utils";
=======
import { useListContext } from "ra-core";
import {
  DataTable,
  List,
  TextInput,
  SelectInput,
  Count,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mail, Smartphone, Phone, Globe } from "lucide-react";
>>>>>>> origin/main

// Store keys for different channel tabs
const storeKeyByChannel = {
  sms: "templates.list.sms",
  email: "templates.list.email",
  push: "templates.list.push",
  whatsapp: "templates.list.whatsapp",
  all: "templates.list.all",
};

// Label-less filters with placeholders
const templateFilters = [
<<<<<<< HEAD
  // Custom filters temporarily removed for demo compatibility
=======
  <TextInput source="q" placeholder="Search templates..." label="" alwaysOn />,
  <SelectInput 
    source="channel" 
    placeholder="Filter by channel" 
    label="" 
    choices={[
      { id: 'SMS', name: 'SMS' },
      { id: 'EMAIL', name: 'Email' },
      { id: 'PUSH', name: 'Push Notification' },
      { id: 'WHATSAPP', name: 'WhatsApp' }
    ]} 
  />,
>>>>>>> origin/main
  <SelectInput 
    source="locale" 
    placeholder="Filter by locale" 
    label="" 
    choices={[
      { id: 'en', name: 'English' },
      { id: 'hi', name: 'Hindi' },
      { id: 'es', name: 'Spanish' },
      { id: 'fr', name: 'French' },
      { id: 'de', name: 'German' }
    ]} 
  />,
];

export const TemplatesList = () => (
  <List
    sort={{ field: "updatedAt", order: "DESC" }}
    filters={templateFilters}
    perPage={10}
  >
    <TabbedDataTable />
  </List>
);

const TabbedDataTable = () => {
  const listContext = useListContext();
  const { filterValues, setFilters, displayedFilters } = listContext;
  
  const handleChange = (value: string) => () => {
    if (value === "all") {
      const { channel, ...otherFilters } = filterValues;
      setFilters(otherFilters, displayedFilters);
    } else {
      setFilters({ ...filterValues, channel: value.toUpperCase() }, displayedFilters);
    }
  };
  
  const getCurrentTab = () => {
    const channel = filterValues.channel?.toLowerCase();
    if (channel === 'sms') return 'sms';
    if (channel === 'email') return 'email';
    if (channel === 'push') return 'push';
    if (channel === 'whatsapp') return 'whatsapp';
    return 'all';
  };
  
  return (
    <Tabs value={getCurrentTab()}>
      <TabsList>
        <TabsTrigger value="sms" onClick={handleChange("sms")}>
          SMS
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, channel: "SMS" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="email" onClick={handleChange("email")}>
          Email
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, channel: "EMAIL" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="push" onClick={handleChange("push")}>
          Push
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, channel: "PUSH" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="whatsapp" onClick={handleChange("whatsapp")}>
          WhatsApp
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, channel: "WHATSAPP" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="all" onClick={handleChange("all")}>
          All Templates
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="sms">
        <TemplatesTable storeKey={storeKeyByChannel.sms} />
      </TabsContent>
      <TabsContent value="email">
        <TemplatesTable storeKey={storeKeyByChannel.email} />
      </TabsContent>
      <TabsContent value="push">
        <TemplatesTable storeKey={storeKeyByChannel.push} />
      </TabsContent>
      <TabsContent value="whatsapp">
        <TemplatesTable storeKey={storeKeyByChannel.whatsapp} />
      </TabsContent>
      <TabsContent value="all">
        <TemplatesTable storeKey={storeKeyByChannel.all} />
      </TabsContent>
    </Tabs>
  );
};

const TemplatesTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
      const channelColors = {
        SMS: 'border-l-4 border-l-blue-500',
        EMAIL: 'border-l-4 border-l-green-500',
        PUSH: 'border-l-4 border-l-purple-500',
        WHATSAPP: 'border-l-4 border-l-green-600',
      };
      return channelColors[record.channel] || 'border-l-4 border-l-gray-400';
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col source="name" label="Template Name" />
    <DataTable.Col source="channel" label="Channel">
      <ChannelIcon />
    </DataTable.Col>
    <DataTable.Col source="locale" label="Locale">
      <LocaleBadge />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
<<<<<<< HEAD
    <DataTable.Col source="createdAt" label="Created" className="hidden md:table-cell">
      <CreatedDateField />
    </DataTable.Col>
    <DataTable.Col source="updatedAt" label="Updated" className="hidden lg:table-cell">
      <UpdatedDateField />
    </DataTable.Col>
  </DataTable>
);

const ChannelIcon = () => {
  const record = useRecordContext();
=======
    <DataTable.Col source="createdAt" label="Created" className="hidden md:table-cell" />
    <DataTable.Col source="updatedAt" label="Updated" className="hidden lg:table-cell" />
    <DataTable.Col source="id" label="ID" className="hidden lg:table-cell" />
  </DataTable>
);

const ChannelIcon = ({ record }: { record?: any }) => {
>>>>>>> origin/main
  if (!record) return null;
  
  const icons = {
    SMS: <MessageSquare className="w-4 h-4" />,
    EMAIL: <Mail className="w-4 h-4" />,
    PUSH: <Smartphone className="w-4 h-4" />,
    WHATSAPP: <Phone className="w-4 h-4" />,
  };
  
  const colors = {
    SMS: 'text-blue-600',
    EMAIL: 'text-green-600',
    PUSH: 'text-purple-600',
    WHATSAPP: 'text-green-500',
  };
  
  return (
    <div className={`flex items-center gap-2 ${colors[record.channel] || 'text-gray-600'}`}>
      {icons[record.channel] || <MessageSquare className="w-4 h-4" />}
      <span>{record.channel}</span>
    </div>
  );
};

<<<<<<< HEAD
const CreatedDateField = () => {
  const record = useRecordContext();
  if (!record || !record.createdAt) return <span className="text-muted-foreground">-</span>;
  return <span>{formatDate(record.createdAt)}</span>;
};

const UpdatedDateField = () => {
  const record = useRecordContext();
  if (!record || !record.updatedAt) return <span className="text-muted-foreground">-</span>;
  return <span>{formatDate(record.updatedAt)}</span>;
};

const LocaleBadge = () => {
  const record = useRecordContext();
=======
const LocaleBadge = ({ record }: { record?: any }) => {
>>>>>>> origin/main
  if (!record || !record.locale) return null;
  
  const localeNames = {
    en: 'English',
    hi: 'हिंदी',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    zh: '中文',
    ja: '日本語',
    ar: 'العربية',
  };
  
  const localeColors = {
    en: 'text-blue-700 bg-blue-100',
    hi: 'text-orange-700 bg-orange-100',
    es: 'text-red-700 bg-red-100',
    fr: 'text-purple-700 bg-purple-100',
    de: 'text-green-700 bg-green-100',
  };
  
  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-500" />
      <Badge className={localeColors[record.locale as keyof typeof localeColors] || 'text-gray-700 bg-gray-100'}>
        {localeNames[record.locale as keyof typeof localeNames] || record.locale}
      </Badge>
    </div>
  );
};

export default TemplatesList;