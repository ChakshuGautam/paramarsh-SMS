"use client";

import { useListContext } from "ra-core";
import {
  DataTable,
  List,
  TextField,
  TextInput,
  SelectInput,
  NumberInput,
  BooleanInput,
  Count,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, Users, BookOpen } from "lucide-react";

// Store keys for different room types
const storeKeyByType = {
  classroom: "rooms.list.classroom",
  laboratory: "rooms.list.laboratory",
  auditorium: "rooms.list.auditorium",
  office: "rooms.list.office",
  library: "rooms.list.library",
  active: "rooms.list.active",
  inactive: "rooms.list.inactive",
  all: "rooms.list.all",
};

// Label-less filters with placeholders
const roomFilters = [
  <TextInput source="q" placeholder="Search rooms..." label={false} alwaysOn />,
  <TextInput source="building" placeholder="Filter by building" label={false} />,
  <SelectInput 
    source="type" 
    placeholder="Filter by type" 
    label={false} 
    choices={[
      { id: 'classroom', name: 'Classroom' },
      { id: 'laboratory', name: 'Laboratory' },
      { id: 'auditorium', name: 'Auditorium' },
      { id: 'office', name: 'Office' },
      { id: 'library', name: 'Library' },
      { id: 'cafeteria', name: 'Cafeteria' },
      { id: 'gym', name: 'Gymnasium' },
      { id: 'other', name: 'Other' }
    ]} 
  />,
  <NumberInput source="floor" placeholder="Filter by floor" label={false} />,
  <NumberInput source="capacity_gte" placeholder="Min capacity" label={false} />,
  <BooleanInput source="isActive" label={false} />,
];

export const RoomsList = () => {
  return (
    <List
      sort={{ field: "building", order: "ASC" }}
      filterDefaultValues={{ isActive: true }}
      filters={roomFilters}
      perPage={25}
    >
      <TabbedDataTable />
    </List>
  );
};

const TabbedDataTable = () => {
  const listContext = useListContext();
  const { filterValues, setFilters, displayedFilters } = listContext;
  
  const handleChange = (value: string) => () => {
    let newFilters = { ...filterValues };
    
    // Clear existing type filters
    delete newFilters.type;
    delete newFilters.isActive;
    
    switch (value) {
      case "classroom":
      case "laboratory":
      case "auditorium":
      case "office":
      case "library":
        newFilters.type = value;
        newFilters.isActive = true;
        break;
      case "active":
        newFilters.isActive = true;
        break;
      case "inactive":
        newFilters.isActive = false;
        break;
      case "all":
        // No additional filters
        break;
    }
    
    setFilters(newFilters, displayedFilters);
  };
  
  // Determine current tab based on filter values
  const getCurrentTab = () => {
    if (filterValues.type && filterValues.isActive === true) return filterValues.type;
    if (filterValues.isActive === true && !filterValues.type) return "active";
    if (filterValues.isActive === false) return "inactive";
    return "all";
  };
  
  return (
    <Tabs value={getCurrentTab()}>
      <TabsList className="flex-wrap">
        <TabsTrigger value="classroom" onClick={handleChange("classroom")}>
          Classrooms
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, type: "classroom", isActive: true }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="laboratory" onClick={handleChange("laboratory")}>
          Labs
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, type: "laboratory", isActive: true }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="auditorium" onClick={handleChange("auditorium")}>
          Auditoriums
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, type: "auditorium", isActive: true }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="active" onClick={handleChange("active")}>
          Active
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, isActive: true }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="inactive" onClick={handleChange("inactive")}>
          Inactive
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, isActive: false }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="all" onClick={handleChange("all")}>
          All Rooms
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="classroom">
        <RoomsTable storeKey={storeKeyByType.classroom} />
      </TabsContent>
      <TabsContent value="laboratory">
        <RoomsTable storeKey={storeKeyByType.laboratory} />
      </TabsContent>
      <TabsContent value="auditorium">
        <RoomsTable storeKey={storeKeyByType.auditorium} />
      </TabsContent>
      <TabsContent value="active">
        <RoomsTable storeKey={storeKeyByType.active} />
      </TabsContent>
      <TabsContent value="inactive">
        <RoomsTable storeKey={storeKeyByType.inactive} />
      </TabsContent>
      <TabsContent value="all">
        <RoomsTable storeKey={storeKeyByType.all} />
      </TabsContent>
    </Tabs>
  );
};

const RoomsTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
      if (!record.isActive) return 'border-l-4 border-l-gray-400 opacity-60';
      
      const typeColors = {
        classroom: 'border-l-4 border-l-blue-500',
        laboratory: 'border-l-4 border-l-green-500',
        auditorium: 'border-l-4 border-l-purple-500',
        office: 'border-l-4 border-l-orange-500',
        library: 'border-l-4 border-l-indigo-500',
      };
      return typeColors[record.type] || 'border-l-4 border-l-gray-500';
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col source="code" label="Code">
      <CodeBadge />
    </DataTable.Col>
    <DataTable.Col source="name" label="Room Name">
      <NameWithIcon />
    </DataTable.Col>
    <DataTable.Col source="capacity" label="Capacity">
      <CapacityBadge />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col source="building" label="Building" className="hidden md:table-cell">
      <BuildingWithIcon />
    </DataTable.Col>
    <DataTable.Col source="floor" label="Floor" className="hidden md:table-cell">
      <FloorBadge />
    </DataTable.Col>
    <DataTable.Col source="type" label="Type" className="hidden lg:table-cell">
      <TypeBadge />
    </DataTable.Col>
    <DataTable.Col source="isActive" label="Status" className="hidden lg:table-cell">
      <StatusBadge />
    </DataTable.Col>
  </DataTable>
);

const CodeBadge = ({ record }: { record?: any }) => {
  if (!record || !record.code) return null;
  
  return (
    <Badge variant="outline" className="font-mono">
      {record.code}
    </Badge>
  );
};

const NameWithIcon = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  const getTypeIcon = (type: string) => {
    const icons = {
      classroom: <BookOpen className="w-4 h-4" />,
      laboratory: <Building className="w-4 h-4" />,
      auditorium: <Users className="w-4 h-4" />,
      office: <Building className="w-4 h-4" />,
      library: <BookOpen className="w-4 h-4" />,
    };
    return icons[type] || <MapPin className="w-4 h-4" />;
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className={record.isActive ? 'text-blue-600' : 'text-gray-400'}>
        {getTypeIcon(record.type)}
      </div>
      <span className={record.isActive ? '' : 'text-gray-500'}>{record.name}</span>
    </div>
  );
};

const CapacityBadge = ({ record }: { record?: any }) => {
  if (!record || record.capacity === undefined) return null;
  
  const getCapacityColor = (capacity: number) => {
    if (capacity >= 100) return 'text-purple-700 bg-purple-100';
    if (capacity >= 50) return 'text-blue-700 bg-blue-100';
    if (capacity >= 20) return 'text-green-700 bg-green-100';
    return 'text-gray-700 bg-gray-100';
  };
  
  return (
    <div className="flex items-center gap-2">
      <Users className="w-4 h-4 text-gray-500" />
      <Badge className={getCapacityColor(record.capacity)}>
        {record.capacity} seats
      </Badge>
    </div>
  );
};

const BuildingWithIcon = ({ record }: { record?: any }) => {
  if (!record || !record.building) return null;
  
  return (
    <div className="flex items-center gap-2">
      <Building className="w-4 h-4 text-orange-600" />
      <span>{record.building}</span>
    </div>
  );
};

const FloorBadge = ({ record }: { record?: any }) => {
  if (!record || record.floor === undefined) return null;
  
  const getFloorText = (floor: number) => {
    if (floor === 0) return 'Ground Floor';
    if (floor < 0) return `Basement ${Math.abs(floor)}`;
    return `Floor ${floor}`;
  };
  
  return (
    <Badge variant="secondary">
      {getFloorText(record.floor)}
    </Badge>
  );
};

const TypeBadge = ({ record }: { record?: any }) => {
  if (!record || !record.type) return null;
  
  const colors = {
    classroom: 'text-blue-700 bg-blue-100',
    laboratory: 'text-green-700 bg-green-100',
    auditorium: 'text-purple-700 bg-purple-100',
    office: 'text-orange-700 bg-orange-100',
    library: 'text-indigo-700 bg-indigo-100',
    cafeteria: 'text-red-700 bg-red-100',
    gym: 'text-yellow-700 bg-yellow-100',
    other: 'text-gray-700 bg-gray-100',
  };
  
  return (
    <Badge className={colors[record.type as keyof typeof colors] || 'text-gray-700 bg-gray-100'}>
      {record.type}
    </Badge>
  );
};

const StatusBadge = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  return (
    <Badge variant={record.isActive ? 'default' : 'secondary'}>
      {record.isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
};