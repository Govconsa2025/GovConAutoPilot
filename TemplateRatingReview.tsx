import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateRatingReviewProps {
  templateId: string;
}

export function TemplateRatingReview({ templateId }: TemplateRatingReviewProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [userRating, setUserRating] = useState<any>(null);

  useEffect(() => {
    loadRatingsAndReviews();
  }, [templateId]);

  const loadRatingsAndReviews = async () => {
    const { data: currentUser } = await supabase.auth.getUser();
    
    const { data: ratings } = await supabase
      .from('template_ratings')
      .select('rating')
      .eq('template_id', templateId);
    
    if (ratings && ratings.length > 0) {
      const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      setAvgRating(avg);
    }

    const { data: userRatingData } = await supabase
      .from('template_ratings')
      .select('*')
      .eq('template_id', templateId)
      .eq('user_id', currentUser.user?.id)
      .single();
    
    setUserRating(userRatingData);
    if (userRatingData) setRating(userRatingData.rating);

    const { data: reviewsData } = await supabase
      .from('template_reviews')
      .select('*')
      .eq('template_id', templateId)
      .order('created_at', { ascending: false });
    
    setReviews(reviewsData || []);
  };

  const handleRatingSubmit = async () => {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (userRating) {
      await supabase
        .from('template_ratings')
        .update({ rating })
        .eq('id', userRating.id);
    } else {
      await supabase.from('template_ratings').insert({
        template_id: templateId,
        user_id: currentUser.user?.id,
        rating
      });
    }

    if (reviewText) {
      await supabase.from('template_reviews').insert({
        template_id: templateId,
        user_id: currentUser.user?.id,
        review_text: reviewText,
        rating
      });
    }

    toast.success('Rating submitted');
    loadRatingsAndReviews();
    setReviewText('');
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Rate This Template</h3>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-6 w-6 cursor-pointer ${
                  star <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {avgRating > 0 ? `${avgRating.toFixed(1)} average` : 'No ratings yet'}
          </span>
        </div>
        <Textarea
          placeholder="Write a review (optional)"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="mb-2"
        />
        <Button onClick={handleRatingSubmit} disabled={rating === 0}>Submit Rating</Button>
      </Card>

      <div className="space-y-3">
        <h3 className="font-semibold">Reviews</h3>
        {reviews.map((review) => (
          <Card key={review.id} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm">{review.review_text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}