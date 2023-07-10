export interface Post {
  title: string;
  overview: string;
  content: any;
  _id: string;
  slug: {
    current: string;
  };
  markdownContent: string;
  _createdAt: string;
}
