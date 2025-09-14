"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import { FLATS, type FlatName } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Droplets, CircleDollarSign, ReceiptText, Save, TrendingUp, RefreshCcw } from "lucide-react";

const initialReadings = FLATS.reduce(
  (acc, flat) => ({ ...acc, [flat]: 0 }),
  {} as Record<FlatName, number>
);

export default function AquaCalcPage() {
  const { toast } = useToast();
  const [previousReadings, setPreviousReadings] = useLocalStorage<Record<FlatName, number>>(
    "aqua-calc-previous-readings",
    initialReadings
  );
  const [currentReadings, setCurrentReadings] = useState<Record<FlatName, number>>(initialReadings);
  const [totalBill, setTotalBill] = useState<number>(0);

  const calculations = useMemo(() => {
    const consumptionData = FLATS.map((flat) => {
      const prev = Number(previousReadings[flat] || 0);
      const curr = Number(currentReadings[flat] || 0);
      const consumption = curr > prev ? curr - prev : 0;
      return { flat, consumption };
    });

    const totalConsumption = consumptionData.reduce((sum, data) => sum + data.consumption, 0);
    const costPerLitre = totalConsumption > 0 ? totalBill / totalConsumption : 0;

    const billingData = consumptionData.map((data) => ({
      ...data,
      bill: data.consumption * costPerLitre,
    }));

    return { totalConsumption, costPerLitre, billingData };
  }, [currentReadings, previousReadings, totalBill]);

  const handlePreviousReadingChange = (flat: FlatName, value: string) => {
    setPreviousReadings((prev) => ({
      ...prev,
      [flat]: value === "" ? 0 : parseInt(value, 10),
    }));
  };

  const handleCurrentReadingChange = (flat: FlatName, value: string) => {
    setCurrentReadings((prev) => ({
      ...prev,
      [flat]: value === "" ? 0 : parseInt(value, 10),
    }));
  };

  const handleTotalBillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTotalBill(value === "" ? 0 : parseFloat(value));
  };

  const handleSaveForNextMonth = () => {
    setPreviousReadings(currentReadings);
    toast({
      title: "Success",
      description: "Current readings have been saved for next month's calculation.",
      variant: "default",
    });
  };

  const handleResetCurrent = () => {
    setCurrentReadings(initialReadings);
    setPreviousReadings(initialReadings);
    setTotalBill(0);
    toast({
      title: "Inputs Cleared",
      description: "All readings and total bill have been reset.",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            AquaCalc
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Monthly Water Bill Calculator
          </p>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ReceiptText className="w-6 h-6" />
              Meter Readings &amp; Total Bill
            </CardTitle>
            <CardDescription>
              Enter the meter readings for each flat and the total water bill.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="total-bill" className="text-base font-semibold">Total Monthly Bill (INR)</Label>
              <div className="relative">
                <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="total-bill"
                  type="number"
                  placeholder="e.g., 5000"
                  value={totalBill || ""}
                  onChange={handleTotalBillChange}
                  className="pl-10 text-lg h-12"
                />
              </div>
            </div>
            <div className="space-y-4">
              {FLATS.map((flat) => (
                <div key={flat} className="space-y-2 p-4 border rounded-lg">
                  <Label className="font-semibold text-base">{flat}</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor={`${flat}-prev`}>Previous Reading (L)</Label>
                      <Input
                        id={`${flat}-prev`}
                        type="number"
                        placeholder="e.g., 10000"
                        value={previousReadings[flat] || ""}
                        onChange={(e) => handlePreviousReadingChange(flat, e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`${flat}-curr`}>Current Reading (L)</Label>
                      <Input
                        id={`${flat}-curr`}
                        type="number"
                        placeholder="e.g., 11000"
                        value={currentReadings[flat] || ""}
                        onChange={(e) => handleCurrentReadingChange(flat, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
           <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleResetCurrent}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Clear Inputs
            </Button>
            <Button onClick={handleSaveForNextMonth}>
              <Save className="mr-2 h-4 w-4" />
              Save for Next Month
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Billing Summary
            </CardTitle>
            <CardDescription>
              A breakdown of water consumption and costs for the month.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"><Droplets/>Total Consumption</p>
                <p className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat('en-IN').format(calculations.totalConsumption)} L
                </p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"><CircleDollarSign/>Cost per Litre</p>
                <p className="text-2xl font-bold text-accent">
                  {formatCurrency(calculations.costPerLitre)}
                </p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Flat</TableHead>
                    <TableHead className="text-right font-semibold">Consumption (L)</TableHead>
                    <TableHead className="text-right font-semibold">Amount to Pay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculations.billingData.map(({ flat, consumption, bill }) => (
                    <TableRow key={flat} className="transition-colors hover:bg-secondary/50">
                      <TableCell className="font-medium">{flat}</TableCell>
                      <TableCell className="text-right tabular-nums">{new Intl.NumberFormat('en-IN').format(consumption)}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums text-accent">{formatCurrency(bill)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
