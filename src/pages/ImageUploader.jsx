import React, { useState } from 'react';
import { User } from '@/entities/User';
import { UploadFile } from '@/integrations/Core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Copy, Check, Image as ImageIcon, Trash2, Plus } from 'lucide-react';
import LoginPrompt from '../components/auth/LoginPrompt';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ImageUploader() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState('');

  React.useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("User not logged in:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    
    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await UploadFile({ file });
        return {
          id: Date.now() + Math.random(),
          name: file.name,
          url: file_url,
          timestamp: new Date()
        };
      });

      const results = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...results, ...prev]);
      
      // Clear the input
      event.target.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback method
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(''), 2000);
    }
  };

  const removeImage = (id) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 flex items-center justify-center">
        <LoadingSpinner message="Loading uploader..." size="large" />
      </div>
    );
  }

  if (!user) {
    return <LoginPrompt />;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Image Uploader</h1>
          <p className="text-lg text-muted-foreground">
            Upload plant images and get stable URLs for your plant library
          </p>
        </div>

        {/* Upload Section */}
        <Card className="border-dashed border-2 border-primary/20 hover:border-primary/40 transition-colors">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary/5 rounded-full mx-auto flex items-center justify-center">
                <Upload className="w-10 h-10 text-primary/60" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Upload Plant Images</h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop images here, or click to select files
                </p>
              </div>

              <div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button 
                    asChild
                    size="lg" 
                    disabled={isUploading}
                    className="cursor-pointer"
                  >
                    <span>
                      {isUploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 mr-2" />
                          Select Images
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>

              <p className="text-xs text-muted-foreground">
                Supports JPG, PNG, WebP. Max 10MB per file.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Alert>
          <ImageIcon className="w-4 h-4" />
          <AlertDescription>
            <strong>How to use:</strong> Upload your plant images here to get stable URLs. 
            Copy the URLs and paste them into the <code>image_url</code> field of your plants 
            in the data dashboard (Dashboard → Data → Plant).
          </AlertDescription>
        </Alert>

        {/* Uploaded Images */}
        {uploadedImages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Uploaded Images ({uploadedImages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                    {/* Image Preview */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img 
                        src={image.url} 
                        alt={image.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Image Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{image.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {image.timestamp.toLocaleString()}
                      </p>
                      
                      {/* URL Display */}
                      <div className="mt-2 p-2 bg-muted rounded text-xs font-mono break-all">
                        {image.url}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant={copiedUrl === image.url ? "secondary" : "outline"}
                        onClick={() => copyToClipboard(image.url)}
                        className="min-w-20"
                      >
                        {copiedUrl === image.url ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copy URL
                          </>
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeImage(image.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}