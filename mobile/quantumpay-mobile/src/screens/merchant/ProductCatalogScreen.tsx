import React, { useState } from 'react';
import { View, Text, SafeAreaView, FlatList, Pressable, Alert } from 'react-native';
import { styled } from 'nativewind';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MerchantStackParamList } from '../../navigation/MerchantNavigator';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { PlusIcon, TrashIcon, PencilIcon } from 'react-native-heroicons/outline';
import useApi, { useApiPost } from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner';
import ProductFormModal from '../../components/merchant/ProductFormModal';
import toast from 'react-hot-toast/mobile';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

type Props = NativeStackScreenProps<MerchantStackParamList, 'ProductCatalog'>;

const ProductCatalogScreen = ({ navigation }: Props) => {
    const { data: products, loading, error, request: refetchProducts } = useApi('/business/products');
    const { post: createProduct, loading: creating } = useApiPost('/business/products');
    const { post: updateProduct, loading: updating } = useApiPost('/business/products/', { method: 'PUT' });
    const { post: deleteProductApi, loading: deleting } = useApiPost('/business/products/', { method: 'DELETE' });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleSaveProduct = async (values, productId) => {
        const payload = { ...values, price: parseFloat(values.price) };
        const action = productId ? updateProduct(payload, { url: `/business/products/${productId}` }) : createProduct(payload);

        const result = await action;
        if (result.success) {
            toast.success(`Product ${productId ? 'updated' : 'created'} successfully!`);
            setIsModalOpen(false);
            setSelectedProduct(null);
            refetchProducts();
        }
    };

    const handleDeleteProduct = (product) => {
        Alert.alert(
            "Delete Product",
            `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: async () => {
                    const result = await deleteProductApi({}, { url: `/business/products/${product.id}` });
                    if (result.success) {
                        toast.success("Product deleted.");
                        refetchProducts();
                    }
                }},
            ]
        );
    };

    const renderItem = ({ item }) => (
        <StyledView className="bg-neutral-900 p-4 rounded-xl mb-3 flex-row justify-between items-center">
            <StyledView className="flex-1">
                <StyledText className="text-white font-semibold">{item.name}</StyledText>
                <StyledText className="text-white font-bold mt-1">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency }).format(item.price)}
                </StyledText>
            </StyledView>
            <StyledView className="flex-row items-center">
                <StyledPressable onPress={() => { setSelectedProduct(item); setIsModalOpen(true); }} className="p-2"><PencilIcon color="#94A3B8" size={20}/></StyledPressable>
                <StyledPressable onPress={() => handleDeleteProduct(item)} className="p-2"><TrashIcon color="#EF4444" size={20}/></StyledPressable>
            </StyledView>
        </StyledView>
    );

    return (
         <StyledSafeAreaView className="flex-1 bg-neutral-950">
            <StyledView className="flex-row items-center justify-between p-4">
                 <StyledView className="flex-row items-center">
                    <StyledPressable onPress={() => navigation.goBack()} className="p-2"><ArrowLeftIcon color="white" size={24} /></StyledPressable>
                    <StyledText className="text-white text-xl font-bold ml-4">Product Catalog</StyledText>
                 </StyledView>
                 <StyledPressable onPress={() => { setSelectedProduct(null); setIsModalOpen(true); }} className="p-2">
                    <PlusIcon color="white" size={24} />
                 </StyledPressable>
            </StyledView>

            {loading && <Spinner />}

            <FlatList
                data={products || []}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 24 }}
                 ListEmptyComponent={
                    <StyledView className="items-center py-20">
                        <StyledText className="text-neutral-500">No products added yet. Tap '+' to create one.</StyledText>
                    </StyledView>
                 }
            />
            <ProductFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
                onSave={handleSaveProduct}
                loading={creating || updating}
            />
        </StyledSafeAreaView>
    );
};

export default ProductCatalogScreen;