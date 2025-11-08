import { useMemo } from 'react';
import { ParsedQuery } from '@/types/image';

export function useSearchParser(searchText: string): ParsedQuery {
  return useMemo(() => {
    const parsed: ParsedQuery = {
      text: '',
      tags: [],
      classes: []
    };

    const parts = searchText.split(/\s+/).filter(Boolean);

    parts.forEach((part) => {
      if (/^[a-zA-Z0-9_-]+:$/.test(part)) return;
      
      if (part.startsWith('tag:')) {
        parsed.tags.push(part.substring(4));
      } else if (part.startsWith('class:')) {
        parsed.classes?.push(part.substring(6));
      } else if (part.startsWith('split:')) {
        const splitValue = part.substring(6);
        if (splitValue === 'train' || splitValue === 'val' || splitValue === 'test') {
          parsed.split = splitValue;
        }
      } else if (part.startsWith('job-status:')) {
        const jobStatus = part.substring(11);
        if (jobStatus === 'assigned' || jobStatus === 'waiting' || jobStatus === 'excluded') {
          parsed.job_status = jobStatus;
        }
      } else if (part.startsWith('filename:')) {
        parsed.filename = part.substring(9);
      } else if (part.startsWith('sort:')) {
        parsed.sort = part.substring(5);
      } else if (part.startsWith('min-annotations:')) {
        parsed.minAnnotations = parseInt(part.substring(16), 10);
      } else if (part.startsWith('max-annotations:')) {
        parsed.maxAnnotations = parseInt(part.substring(16), 10);
      } else if (part.startsWith('min-height:')) {
        parsed.minHeight = parseInt(part.substring(11), 10);
      } else if (part.startsWith('max-height:')) {
        parsed.maxHeight = parseInt(part.substring(11), 10);
      } else if (part.startsWith('min-width:')) {
        parsed.minWidth = parseInt(part.substring(10), 10);
      } else if (part.startsWith('max-width:')) {
        parsed.maxWidth = parseInt(part.substring(10), 10);
      } else if (part.startsWith('job:')) {
        parsed.job = part.substring(4);
      } else if (part.startsWith('like-image:')) {
        parsed.likeImage = part.substring(11);
      } else if (part.startsWith('backend:')) {
        parsed.backend = part.substring(8);
      } else if (part.startsWith('status:')) {
        parsed.status = part.substring(7);
      } else {
        parsed.text += (parsed.text ? ' ' : '') + part;
      }
    });

    console.log(parsed)

    return parsed;
  }, [searchText]);
}
