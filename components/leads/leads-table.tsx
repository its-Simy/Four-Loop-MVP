"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Mail, Phone, Linkedin, Search } from 'lucide-react';
import { Card } from "@/components/ui/card";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  linkedin_url: string | null;
  source: string | null;
  status: string;
  projects: { name: string } | null;
}

interface LeadsTableProps {
  leads: Lead[];
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = leads.filter((lead) => {
    const query = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.company?.toLowerCase().includes(query) ||
      lead.title?.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "contacted":
        return "bg-yellow-100 text-yellow-800";
      case "scheduled":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="bg-gray-800/50 border-white/20">
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search leads by name, email, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-700/50 border-white/10 text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">
            {searchQuery ? "No leads found matching your search" : "No leads yet. Add your first lead to get started!"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-gray-700/30">
                <TableHead className="text-gray-300">Name</TableHead>
                <TableHead className="text-gray-300">Company</TableHead>
                <TableHead className="text-gray-300">Title</TableHead>
                <TableHead className="text-gray-300">Contact</TableHead>
                <TableHead className="text-gray-300">Project</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Source</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="border-white/10 hover:bg-gray-700/30">
                  <TableCell className="font-medium text-white">{lead.name}</TableCell>
                  <TableCell className="text-gray-300">{lead.company || "-"}</TableCell>
                  <TableCell className="text-gray-300">{lead.title || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-blue-400 hover:text-blue-300"
                          title={lead.email}
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-blue-400 hover:text-blue-300"
                          title={lead.phone}
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                      {lead.linkedin_url && (
                        <a
                          href={lead.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.projects ? (
                      <span className="text-sm text-gray-400">{lead.projects.name}</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(lead.status)} variant="secondary">
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {lead.source ? (
                      <span className="text-sm text-gray-400 capitalize">{lead.source.replace('_', ' ')}</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Schedule Interview</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
