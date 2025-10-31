// src/components/upload/TagInput.tsx
import React, { useState } from "react";
import { X, Tag } from "lucide-react";
import { Input } from "@/components/ui/ui/input";
import { Button } from "@/components/ui/ui/button";

interface TagInputProps {
  tags: string[];
  onChange: (newTags: string[]) => void;
  disabled?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({ tags, onChange, disabled }) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue("");
  };

  const handleRemoveTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-gray-500 shrink-0 h-9" />
        <Input
          placeholder="Add tags (press Enter)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="flex-1 h9"
        />
        <Button
          type="button"
          onClick={handleAddTag}
          disabled={!inputValue.trim() || disabled}
          variant="outline"
          size="sm"
          className="h9"
        >
          Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag) => (
          <div
            key={tag}
            className="flex items-center px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-2 hover:text-red-500"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
