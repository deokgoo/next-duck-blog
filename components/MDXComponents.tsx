import TOCInlinePliny from 'pliny/ui/TOCInline';
import Pre from 'pliny/ui/Pre';

// next-mdx-remote는 contentlayer와 달리 toc 데이터를 자동 생성하지 않습니다.
// pliny의 TOCInline은 toc가 undefined이면 .filter()에서 crash하므로 안전하게 처리합니다.
const TOCInline = (props: Parameters<typeof TOCInlinePliny>[0]) => {
  if (!props.toc || !Array.isArray(props.toc)) return null;
  return <TOCInlinePliny {...props} />;
};
// import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm'; // 제거: 한국어 버전으로 교체
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
import KoreanNewsletterForm from './KoreanNewsletterForm';

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

  // 뉴스레터 폼들 (담백하고 유연하게)
  BlogNewsletterForm: KoreanNewsletterForm, // 🎯 기본 컴포넌트를 한국어로 교체!
  KoreanNewsletterForm, // 명시적 한국어 버전
  EnglishNewsletterForm: (props) => <KoreanNewsletterForm language="en" {...props} />, // 영어 버전
  CompactNewsletterForm: (props) => <KoreanNewsletterForm compact={true} showBenefits={false} {...props} />, // 컴팩트 버전
  SimpleNewsletterForm: (props) => <KoreanNewsletterForm showBenefits={false} {...props} />, // 혜택 목록 없는 간단 버전
  MinimalNewsletterForm: (props) => <KoreanNewsletterForm compact={true} showBenefits={false} title="뉴스레터 구독" subtitle="새 글을 받아보세요" {...props} />, // 최소한의 정보만

  ExpandableSection,
  Expand: ExpandableSection,
  SOLIDChecklistModal,
  ChromeDevToolsMCPSetupModal,
  CodeComparison,
  Mermaid,
};
