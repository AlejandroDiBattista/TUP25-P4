import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ComprasPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalle de Compra</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Selecciona una compra para ver el detalle.</p>
      </CardContent>
    </Card>
  );
}
