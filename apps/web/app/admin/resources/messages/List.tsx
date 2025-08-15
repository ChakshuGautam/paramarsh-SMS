"use client";

import { useListContext } from "ra-core";
import {
  DataTable,
  List,
  ReferenceField,
  TextField,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  SelectInput,
  DateInput,
  Count,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mail, Smartphone, Phone } from "lucide-react";

// Store keys for different status tabs
const storeKeyByStatus = {
  pending: "messages.list.pending",
  sent: "messages.list.sent",
  delivered: "messages.list.delivered",
  failed: "messages.list.failed",
};

// Label-less filters with placeholders
const messageFilters = [
  <TextInput source="q" placeholder="Search messages..." label="" alwaysOn />,
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
  <ReferenceInput source="templateId" reference="templates">
    <AutocompleteInput placeholder="Filter by template" label="" optionText="name" />
  </ReferenceInput>,
  <ReferenceInput source="campaignId" reference="campaigns">
    <AutocompleteInput placeholder="Filter by campaign" label="" optionText="name" />
  </ReferenceInput>,
  <TextInput source="to" placeholder="Filter by recipient" label="" />,
  <DateInput source="sentAt_gte" placeholder="Sent after" label="" />,
];

export const MessagesList = () => (
  <List
    sort={{ field: "sentAt", order: "DESC" }}
    filterDefaultValues={{ status: "sent" }}
    filters={messageFilters}
    perPage={10}
  >
    <TabbedDataTable />
  </List>
);

const TabbedDataTable = () => {
  const listContext = useListContext();
  const { filterValues, setFilters, displayedFilters } = listContext;
  
  const handleChange = (value: string) => () => {
    setFilters({ ...filterValues, status: value }, displayedFilters);
  };
  
  return (
    <Tabs value={filterValues.status ?? "sent"}>
      <TabsList>
        <TabsTrigger value="pending" onClick={handleChange("pending")}>
          Pending
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "pending" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="sent" onClick={handleChange("sent")}>
          Sent
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "sent" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="delivered" onClick={handleChange("delivered")}>
          Delivered
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "delivered" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="failed" onClick={handleChange("failed")}>
          Failed
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "failed" }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="pending">
        <MessagesTable storeKey={storeKeyByStatus.pending} />
      </TabsContent>
      <TabsContent value="sent">
        <MessagesTable storeKey={storeKeyByStatus.sent} />
      </TabsContent>
      <TabsContent value="delivered">
        <MessagesTable storeKey={storeKeyByStatus.delivered} />
      </TabsContent>
      <TabsContent value="failed">
        <MessagesTable storeKey={storeKeyByStatus.failed} />
      </TabsContent>
    </Tabs>
  );
};

const MessagesTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
      const statusColors = {
        pending: 'border-l-4 border-l-yellow-500',
        sent: 'border-l-4 border-l-blue-500',
        delivered: 'border-l-4 border-l-green-500',
        failed: 'border-l-4 border-l-red-500',
      };
      return statusColors[record.status] || '';
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col source="channel" label="Channel">
      <ChannelIcon />
    </DataTable.Col>
    <DataTable.Col source="to" label="To" />
    <DataTable.Col source="status" label="Status">
      <StatusBadge />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col label="Template" className="hidden md:table-cell">
      <ReferenceField reference="templates" source="templateId">
        <TextField source="name" />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col label="Campaign" className="hidden lg:table-cell">
      <ReferenceField reference="campaigns" source="campaignId">
        <TextField source="name" />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col source="sentAt" label="Sent At" className="hidden lg:table-cell" />
    <DataTable.Col source="id" label="ID" className="hidden lg:table-cell" />
  </DataTable>
);

const StatusBadge = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  const variants = {
    pending: 'warning',
    sent: 'secondary',
    delivered: 'default',
    failed: 'destructive',
  } as const;
  
  return (
    <Badge variant={variants[record.status as keyof typeof variants] || 'default'}>
      {record.status}
    </Badge>
  );
};

const ChannelIcon = ({ record }: { record?: any }) => {
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
    <div className={`flex items-center gap-2 ${colors[record.channel] || ''}`}>
      {icons[record.channel]}
      <span>{record.channel}</span>
    </div>
  );
};

export default MessagesList;