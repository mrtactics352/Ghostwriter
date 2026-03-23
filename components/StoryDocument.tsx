
'use client';

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

interface CoverDesign {
  title: string;
  subtitle: string;
  author: string;
  layout: string;
  typography: string;
  background_color: string;
}

const styles = StyleSheet.create({
  page: {
    padding: '1in',
  },
  coverPage: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  title: {
    fontSize: 48,
    marginBottom: 20,
    fontFamily: 'Times-Roman',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    fontFamily: 'Times-Roman',
    fontStyle: 'italic',
    marginBottom: 30,
    textAlign: 'center',
  },
  author: {
    fontSize: 22,
    fontFamily: 'Times-Roman',
    textAlign: 'center',
  },
  body: {
    fontFamily: 'Times-Roman',
    fontSize: 12,
    lineHeight: 1.5,
  },
});

interface StoryDocumentProps {
  title: string;
  author: string;
  content: string;
  coverDesign: CoverDesign | null;
}

const StoryDocument: React.FC<StoryDocumentProps> = ({ title, author, content, coverDesign }) => (
  <Document>
    <Page size="A4" style={{...styles.page, backgroundColor: coverDesign?.background_color || '#FFFFFF'}}>
      <View style={styles.coverPage}>
        <Text style={{...styles.title, fontFamily: coverDesign?.typography === 'Serif' ? 'Times-Roman' : 'Helvetica'}}>{coverDesign?.title || title}</Text>
        {coverDesign?.subtitle && <Text style={{...styles.subtitle, fontFamily: coverDesign?.typography === 'Serif' ? 'Times-Roman' : 'Helvetica'}}>{coverDesign.subtitle}</Text>}
        <Text style={{...styles.author, fontFamily: coverDesign?.typography === 'Serif' ? 'Times-Roman' : 'Helvetica'}}>{coverDesign?.author || author}</Text>
      </View>
    </Page>
    <Page size="A4" style={styles.page}>
      <Text style={styles.body}>{content}</Text>
    </Page>
  </Document>
);

export default StoryDocument;
