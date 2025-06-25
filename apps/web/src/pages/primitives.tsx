import React from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "../components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import { Tooltip, TooltipTrigger, TooltipContent } from "../components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Spinner } from "../components/ui/spinner";
// Table is often a set of components, so we'll use a simple example
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table";

export default function PrimitivesShowcase() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">UI Primitives Showcase</h1>
      <div className="space-x-4">
        <Button>Button</Button>
        <Button variant="outline">Outline</Button>
      </div>
      <div>
        <Input placeholder="Input" />
      </div>
      <div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="one">One</SelectItem>
            <SelectItem value="two">Two</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Checkbox id="cb1" /> <label htmlFor="cb1">Checkbox</label>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>Card content goes here.</CardContent>
      </Card>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <p>This is a dialog content.</p>
        </DialogContent>
      </Dialog>
      <Alert>
        <AlertTitle>Alert Title</AlertTitle>
        <AlertDescription>This is an alert description.</AlertDescription>
      </Alert>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Tooltip content</TooltipContent>
      </Tooltip>
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content for Tab 1</TabsContent>
        <TabsContent value="tab2">Content for Tab 2</TabsContent>
      </Tabs>
      <div>
        <Spinner />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
            <TableCell>alice@example.com</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Bob</TableCell>
            <TableCell>bob@example.com</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
} 