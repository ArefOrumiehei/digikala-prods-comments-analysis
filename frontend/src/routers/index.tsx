import { BrowserRouter, Routes, Route } from 'react-router';
import SentimentLanding from '../pages/landings/SentimentLanding';
import TextAnalyzer from '../pages/text-analyzer/TextAnalyzer';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<SentimentLanding />} />
        <Route path="/text-analyzer" element={<TextAnalyzer />} />
      </Routes>
    </BrowserRouter>
  );
}
