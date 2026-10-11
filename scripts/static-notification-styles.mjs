import fs from 'node:fs/promises';
import ts from 'typescript';
/** The official stylesheet is shipped once; the official runtime keeps queue semantics. */
export const staticNotificationStyles = {
  name: 'static-notification-styles',
  setup(build) {
    build.onLoad({filter:/[\\/]sonner[\\/]dist[\\/]index\.m?js$/},async({path})=>{
      const source=await fs.readFile(path,'utf8');
      const parsed=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
      const calls=parsed.statements.filter(statement=>ts.isExpressionStatement(statement)&&ts.isCallExpression(statement.expression)&&ts.isIdentifier(statement.expression.expression)&&statement.expression.expression.text==='__insertCSS');
      if(calls.length!==1)throw Error('SONNER_STYLE_INJECTION_CONTRACT_CHANGED');
      const statement=calls[0];
      return {contents:source.slice(0,statement.getStart(parsed))+source.slice(statement.end),loader:'js'};
    });
    build.onLoad({filter:/[\\/]@radix-ui[\\/]react-select[\\/]dist[\\/]index\.m?js$/},async({path})=>{
      const source=await fs.readFile(path,'utf8'),parsed=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),calls=[];
      function visit(node){if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&node.expression.text==='jsx'&&ts.isStringLiteral(node.arguments[0])&&node.arguments[0].text==='style'&&node.getText(parsed).includes('data-radix-select-viewport'))calls.push(node);ts.forEachChild(node,visit);}
      visit(parsed);if(calls.length!==1)throw Error('RADIX_SELECT_STYLE_CONTRACT_CHANGED');
      const node=calls[0];return {contents:source.slice(0,node.getStart(parsed))+'null'+source.slice(node.end),loader:'js'};
    });
  },
};
