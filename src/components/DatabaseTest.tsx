import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DatabaseTest = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testCommentsTable = async () => {
    setLoading(true);
    setTestResult('Testing comments table...');
    
    try {
      // Test if comments table exists
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .limit(1);
      
      if (error) {
        setTestResult(`Error: ${error.message}`);
        console.error('Comments table error:', error);
      } else {
        setTestResult(`Comments table exists! Found ${data?.length || 0} comments.`);
      }
    } catch (err) {
      setTestResult(`Exception: ${err}`);
      console.error('Exception:', err);
    }
    
    setLoading(false);
  };

  const testCommentLikesTable = async () => {
    setLoading(true);
    setTestResult('Testing comment_likes table...');
    
    try {
      // Test if comment_likes table exists
      const { data, error } = await supabase
        .from('comment_likes')
        .select('*')
        .limit(1);
      
      if (error) {
        setTestResult(`Error: ${error.message}`);
        console.error('Comment likes table error:', error);
      } else {
        setTestResult(`Comment likes table exists! Found ${data?.length || 0} likes.`);
      }
    } catch (err) {
      setTestResult(`Exception: ${err}`);
      console.error('Exception:', err);
    }
    
    setLoading(false);
  };

  const testInsertComment = async () => {
    setLoading(true);
    setTestResult('Testing comment insert...');
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
          author_name: 'Test User',
          author_email: 'test@example.com',
          content: 'Test comment',
          user_id: null,
          approved: false
        })
        .select();
      
      if (error) {
        setTestResult(`Insert Error: ${error.message}`);
        console.error('Insert error:', error);
      } else {
        setTestResult(`Insert successful! Comment ID: ${data?.[0]?.id}`);
      }
    } catch (err) {
      setTestResult(`Insert Exception: ${err}`);
      console.error('Insert exception:', err);
    }
    
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Database Test</h2>
      
      <div className="space-y-4">
        <button
          onClick={testCommentsTable}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Comments Table
        </button>
        
        <button
          onClick={testCommentLikesTable}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Comment Likes Table
        </button>
        
        <button
          onClick={testInsertComment}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Comment Insert
        </button>
      </div>
      
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold">Result:</h3>
        <p className="mt-2">{testResult}</p>
      </div>
    </div>
  );
};

export default DatabaseTest;
