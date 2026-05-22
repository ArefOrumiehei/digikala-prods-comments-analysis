import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import SentimentLanding from '../pages/landings/SentimentLanding';
import TextAnalyzer from '../pages/text-analyzer/TextAnalyzer';
import ProductSearch from '../pages/product-search/ProductSearch';
import ProductDetails from '../pages/product-details/ProductDetails';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<SentimentLanding />} />
        <Route path="/text-analyzer" element={<TextAnalyzer />} />
        <Route path="/products" element={<Navigate to="/products/search" replace />} />
        <Route path="/products/search" element={<ProductSearch />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}