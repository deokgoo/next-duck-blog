import TOCInline from 'pliny/ui/TOCInline';
import Pre from 'pliny/ui/Pre';
import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm';
import type { MDXComponents } from 'mdx/types';
import Image from './Image';
import CustomLink from './Link';
import TableWrapper from './TableWrapper';
import ExpandableSection from './ExpandableSection';
import DoubleImage from './DoubleImage';
import SOLIDChecklistModal from './SOLIDChecklistModal';
import ChromeDevToolsMCPSetupModal from './ChromeDevToolsMCPSetupModal';
import CodeComparison from './CodeComparison';
import Mermaid from './Mermaid';

const PreWithMermaid = (props) => {
  const { children, className, ...rest } = props;

  if (className?.includes('mermaid')) {
    let code = '';
    if (typeof children === 'string') {
      code = children;
    } else if (children && children.props && typeof children.props.children === 'string') {
      code = children.props.children;
    }

    if (code) {
      return <Mermaid chart={code} />;
    }
    return null;
  }

  return <Pre {...props} />;
};

export const components: MDXComponents = {
  Image,
  DoubleImage,
  TOCInline,
  a: CustomLink,
  pre: PreWithMermaid,
  table: TableWrapper,
  BlogNewsletterForm,
  Expand: ExpandableSection,
  SOLIDChecklistModal,
  ChromeDevToolsMCPSetupModal,
  CodeComparison,
  Mermaid,
};
