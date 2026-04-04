import sys

class XMLWriter:
	def __init__(self, output_file_name):
		self.output_file = open(output_file_name, "w")
		self.depth = 0
	
	def output_tag_with_text(self, name, text):
		prefix = "\t" * self.depth
		self.output_file.write(prefix + "<" + name + ">" + text + "</" + name + ">\n")

	def output_start_tag(self, name):
		prefix = "\t" * self.depth
		self.output_file.write(prefix + "<" + name + ">\n")
		self.depth += 1

	def output_end_tag(self, name):
		prefix = "\t" * self.depth
		self.output_file.write(prefix + "</" + name + ">\n")
		self.depth -= 1
	
	def close(self):
		self.output_file.close()

def escape_xml(s):
	escaped = s.replace("&", "&amp;")
	escaped = escaped.replace("<", "&lt;")
	escaped = escaped.replace(">", "&gt;")
	escaped = escaped.replace("\"", "&quot;")
	escaped = escaped.replace("'", "&apos;")
	return escaped

def unescape_xml(s):
	unescaped = s.replace("&amp;", "&")
	unescaped = unescaped.replace("&lt;", "<")
	unescaped = unescaped.replace("&gt;", ">")
	unescaped = unescaped.replace("&quot;", "\"")
	unescaped = unescaped.replace("&apos;", "'")
	return unescaped

def cdata(text):
	return "<![CDATA[" + text + "]]>"

def print_err(s):
	print(s, file=sys.stderr)
	
