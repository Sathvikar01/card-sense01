'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, ArrowUpDown, Calendar, Store } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  amount: number;
  category: string;
  merchant_name?: string;
  transaction_date: string;
  description?: string;
  card_used?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionDeleted?: () => void;
}

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': 'bg-orange-100 text-orange-800',
  'Groceries': 'bg-green-100 text-green-800',
  'Shopping': 'bg-purple-100 text-purple-800',
  'Transportation': 'bg-blue-100 text-blue-800',
  'Entertainment': 'bg-pink-100 text-pink-800',
  'Bills & Utilities': 'bg-yellow-100 text-yellow-800',
  'Healthcare': 'bg-red-100 text-red-800',
  'Travel': 'bg-indigo-100 text-indigo-800',
  'Education': 'bg-cyan-100 text-cyan-800',
  'Personal Care': 'bg-teal-100 text-teal-800',
  'Fuel': 'bg-slate-100 text-slate-800',
  'Online Shopping': 'bg-violet-100 text-violet-800',
  'Subscriptions': 'bg-fuchsia-100 text-fuchsia-800',
  'Other': 'bg-gray-100 text-gray-800',
};

type SortField = 'date' | 'amount';
type SortOrder = 'asc' | 'desc';

export function TransactionList({ transactions, onTransactionDeleted }: TransactionListProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortField === 'date') {
      const dateA = new Date(a.transaction_date).getTime();
      const dateB = new Date(b.transaction_date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
  });

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/spending?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      toast.success('Transaction deleted successfully');

      onTransactionDeleted?.();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Store className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
          <p className="text-sm text-muted-foreground text-center">
            Start tracking your spending by adding your first transaction.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('date')}
                  className="hover:bg-transparent"
                >
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('amount')}
                  className="hover:bg-transparent ml-auto"
                >
                  Amount
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {transaction.merchant_name || 'Unknown'}
                    </div>
                    {transaction.description && (
                      <div className="text-sm text-muted-foreground">
                        {transaction.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'font-medium',
                      CATEGORY_COLORS[transaction.category] || CATEGORY_COLORS['Other']
                    )}
                  >
                    {transaction.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  ₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === transaction.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this
                          transaction from your records.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(transaction.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        <div className="flex gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('date')}
            className={cn(sortField === 'date' && 'bg-accent')}
          >
            Sort by Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('amount')}
            className={cn(sortField === 'amount' && 'bg-accent')}
          >
            Sort by Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
        {sortedTransactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="font-semibold text-lg">
                    {transaction.merchant_name || 'Unknown'}
                  </div>
                  {transaction.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {transaction.description}
                    </p>
                  )}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deletingId === transaction.id}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this
                        transaction from your records.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(transaction.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="flex justify-between items-center">
                <Badge
                  variant="secondary"
                  className={cn(
                    'font-medium',
                    CATEGORY_COLORS[transaction.category] || CATEGORY_COLORS['Other']
                  )}
                >
                  {transaction.category}
                </Badge>
                <span className="font-bold text-lg">
                  ₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
