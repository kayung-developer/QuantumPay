import React from 'react';
import { View } from 'react-native';
import Modal from '../common/Modal.native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import StyledTextInput from '../common/StyledTextInput';
import StyledButton from '../common/StyledButton';

const ProductSchema = Yup.object().shape({
    name: Yup.string().required('Product name is required'),
    price: Yup.number().positive('Price must be a positive number').required('Price is required'),
    currency: Yup.string().length(3).required('Currency is required'),
    description: Yup.string(),
});

const ProductFormModal = ({ isOpen, onClose, product, onSave, loading }) => {
    const isEditing = !!product;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Product' : 'Add New Product'}>
            <Formik
                initialValues={{
                    name: product?.name || '',
                    price: product?.price || '',
                    currency: product?.currency || 'NGN',
                    description: product?.description || '',
                }}
                validationSchema={ProductSchema}
                onSubmit={(values) => onSave(values, product?.id)}
                enableReinitialize
            >
                {({ handleSubmit, ...formikProps }) => (
                    <View>
                        <StyledTextInput label="Product Name" name="name" {...formikProps} />
                        <View style={{ height: 16 }}/>
                        <StyledTextInput label="Price" name="price" keyboardType="numeric" {...formikProps} />
                        {/* Currency would ideally be a picker */}
                        <View style={{ height: 24 }}/>
                        <StyledButton label={isEditing ? "Save Changes" : "Add Product"} onPress={handleSubmit} isLoading={loading} />
                    </View>
                )}
            </Formik>
        </Modal>
    );
};

export default ProductFormModal;