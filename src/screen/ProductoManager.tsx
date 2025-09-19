import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, TextInput, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

type Product = {
  id: number;
  code: string;
  name: string;
};

export default function ProductManager() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState<Product[]>([
    { id: 1, code: "1234", name: "Coca Cola" },
    { id: 2, code: "6789", name: "Fanta" },
  ]);

  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setShowCamera(false);
    setLoading(true);

    try {
      const newProduct: Product = {
        id: Date.now(),
        code: data,
        name: "Nuevo Producto",
      };
      setProducts([...products, newProduct]);
      Alert.alert("Éxito !", `Producto agregado: ${data}`);
    } catch (error) {
      Alert.alert("Error", "No se pudo agregar el producto");
    } finally {
      setLoading(false);
    }
  };

  const editProduct = (id: number) => {
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, name: editName || p.name } : p
      )
    );
    Alert.alert("Éxito", "Producto modificado");
    setEditName("");
  };

  const deleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
    Alert.alert("Éxito", "Producto eliminado");
  };

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text>Se necesita permiso para usar la cámara</Text>
        <Button title="Dar permiso" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {loading && <ActivityIndicator size="large" color="blue" />}
      {showCamera ? (
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "ean13", "ean8", "code128"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <Button title="Escanear código" onPress={() => {setShowCamera(true); setScanned(false);}} />

          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.productItem}>
                <Text>{item.name} ({item.code})</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nuevo nombre"
                  value={editName}
                  onChangeText={setEditName}
                />
                <Button title="Modificar" onPress={() => editProduct(item.id)} />
                <Button title="Eliminar" onPress={() => deleteProduct(item.id)} />
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  productItem: { marginVertical: 10, padding: 10, backgroundColor: "#eee", borderRadius: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", marginVertical: 5, padding: 5, borderRadius: 5 }
});
