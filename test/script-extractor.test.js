const FileUtils = require('../src/utils/file-utils');
const ScriptExtractor = require('../src/services/script-extractor');

// Mock FileUtils module
jest.mock('../src/utils/file-utils');

describe('ScriptExtractor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractScriptBlocks', () => {
    it('should extract script blocks from Vue files and create temp files', () => {
      const vueFiles = ['/test/component.vue', '/test/page.vue'];
      const jsFiles = ['/test/utils.js'];
      const targetPathResolved = '/test';
      const tempDir = '/temp/dir';

      const mockVueContent1 = `
        <template>
          <div>Hello</div>
        </template>
        <script>
          export default {
            name: 'Component',
            data() {
              return { message: 'Hello' };
            }
          }
        </script>
      `;

      const mockVueContent2 = `
        <template>
          <div>World</div>
        </template>
        <script>
          export default {
            name: 'Page'
          }
        </script>
      `;

      const mockJsContent = 'function helper() { return true; }';

      // Mock FileUtils methods
      FileUtils.readFile
        .mockReturnValueOnce(mockVueContent1)
        .mockReturnValueOnce(mockVueContent2)
        .mockReturnValueOnce(mockJsContent);
      
      FileUtils.getRelativePath
        .mockReturnValueOnce('component.vue')
        .mockReturnValueOnce('page.vue')
        .mockReturnValueOnce('utils.js');
      
      FileUtils.joinPath
        .mockReturnValueOnce('/temp/dir/component.js')
        .mockReturnValueOnce('/temp/dir/page.js')
        .mockReturnValueOnce('/temp/dir/utils.js');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = ScriptExtractor.extractScriptBlocks(vueFiles, jsFiles, targetPathResolved, tempDir);

      // Verify Vue file processing
      expect(FileUtils.readFile).toHaveBeenCalledWith('/test/component.vue');
      expect(FileUtils.readFile).toHaveBeenCalledWith('/test/page.vue');
      expect(FileUtils.readFile).toHaveBeenCalledWith('/test/utils.js');

      // Verify temp file creation
      expect(FileUtils.writeFile).toHaveBeenCalledWith('/temp/dir/component.js', expect.stringContaining('export default'));
      expect(FileUtils.writeFile).toHaveBeenCalledWith('/temp/dir/page.js', expect.stringContaining('export default'));
      expect(FileUtils.writeFile).toHaveBeenCalledWith('/temp/dir/utils.js', mockJsContent);

      // Verify result structure
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        originalFile: '/test/component.vue',
        tempFile: '/temp/dir/component.js',
        tempFileName: 'component.js',
        originalName: 'component.vue',
        fileType: 'vue'
      });

      expect(result[1]).toEqual({
        originalFile: '/test/page.vue',
        tempFile: '/temp/dir/page.js',
        tempFileName: 'page.js',
        originalName: 'page.vue',
        fileType: 'vue'
      });

      expect(result[2]).toEqual({
        originalFile: '/test/utils.js',
        tempFile: '/temp/dir/utils.js',
        tempFileName: 'utils.js',
        originalName: 'utils.js',
        fileType: 'js'
      });

      consoleSpy.mockRestore();
    });

    it('should handle Vue files without script blocks', () => {
      const vueFiles = ['/test/no-script.vue'];
      const jsFiles = [];
      const targetPathResolved = '/test';
      const tempDir = '/temp/dir';

      const mockVueContent = `
        <template>
          <div>No script block</div>
        </template>
      `;

      FileUtils.readFile.mockReturnValue(mockVueContent);
      FileUtils.getRelativePath.mockReturnValue('no-script.vue');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = ScriptExtractor.extractScriptBlocks(vueFiles, jsFiles, targetPathResolved, tempDir);

      expect(result).toHaveLength(0);
      expect(console.log).toHaveBeenCalledWith('⚠️  no-script.vue: (no <script> block found)');

      consoleSpy.mockRestore();
    });

    it('should handle Vue files with empty script blocks', () => {
      const vueFiles = ['/test/empty-script.vue'];
      const jsFiles = [];
      const targetPathResolved = '/test';
      const tempDir = '/temp/dir';

      const mockVueContent = `
        <template>
          <div>Empty script</div>
        </template>
        <script>
        </script>
      `;

      FileUtils.readFile.mockReturnValue(mockVueContent);
      FileUtils.getRelativePath.mockReturnValue('empty-script.vue');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = ScriptExtractor.extractScriptBlocks(vueFiles, jsFiles, targetPathResolved, tempDir);

      expect(result).toHaveLength(0);
      expect(console.log).toHaveBeenCalledWith('⚠️  empty-script.vue: (no <script> block found)');

      consoleSpy.mockRestore();
    });

    it('should handle Vue files with whitespace-only script blocks', () => {
      const vueFiles = ['/test/whitespace-script.vue'];
      const jsFiles = [];
      const targetPathResolved = '/test';
      const tempDir = '/temp/dir';

      const mockVueContent = `
        <template>
          <div>Whitespace script</div>
        </template>
        <script>
          
        </script>
      `;

      FileUtils.readFile.mockReturnValue(mockVueContent);
      FileUtils.getRelativePath.mockReturnValue('whitespace-script.vue');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = ScriptExtractor.extractScriptBlocks(vueFiles, jsFiles, targetPathResolved, tempDir);

      expect(result).toHaveLength(0);
      expect(console.log).toHaveBeenCalledWith('⚠️  whitespace-script.vue: (no <script> block found)');

      consoleSpy.mockRestore();
    });

    it('should process JavaScript files directly', () => {
      const vueFiles = [];
      const jsFiles = ['/test/helper.js', '/test/utils.js'];
      const targetPathResolved = '/test';
      const tempDir = '/temp/dir';

      const mockJsContent1 = 'function helper() { return true; }';
      const mockJsContent2 = 'function utils() { return false; }';

      FileUtils.readFile
        .mockReturnValueOnce(mockJsContent1)
        .mockReturnValueOnce(mockJsContent2);
      
      FileUtils.getRelativePath
        .mockReturnValueOnce('helper.js')
        .mockReturnValueOnce('utils.js');
      
      FileUtils.joinPath
        .mockReturnValueOnce('/temp/dir/helper.js')
        .mockReturnValueOnce('/temp/dir/utils.js');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = ScriptExtractor.extractScriptBlocks(vueFiles, jsFiles, targetPathResolved, tempDir);

      expect(result).toHaveLength(2);
      expect(FileUtils.writeFile).toHaveBeenCalledWith('/temp/dir/helper.js', mockJsContent1);
      expect(FileUtils.writeFile).toHaveBeenCalledWith('/temp/dir/utils.js', mockJsContent2);

      consoleSpy.mockRestore();
    });

    it('should handle mixed Vue and JavaScript files', () => {
      const vueFiles = ['/test/component.vue'];
      const jsFiles = ['/test/utils.js'];
      const targetPathResolved = '/test';
      const tempDir = '/temp/dir';

      const mockVueContent = `
        <template><div></div></template>
        <script>
          export default { name: 'Component' }
        </script>
      `;
      const mockJsContent = 'function utils() { }';

      FileUtils.readFile
        .mockReturnValueOnce(mockVueContent)
        .mockReturnValueOnce(mockJsContent);
      
      FileUtils.getRelativePath
        .mockReturnValueOnce('component.vue')
        .mockReturnValueOnce('utils.js');
      
      FileUtils.joinPath
        .mockReturnValueOnce('/temp/dir/component.js')
        .mockReturnValueOnce('/temp/dir/utils.js');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = ScriptExtractor.extractScriptBlocks(vueFiles, jsFiles, targetPathResolved, tempDir);

      expect(result).toHaveLength(2);
      expect(result[0].fileType).toBe('vue');
      expect(result[1].fileType).toBe('js');

      consoleSpy.mockRestore();
    });
  });

  describe('createTempFileName', () => {
    it('should convert Vue file paths to JS temp file names', () => {
      expect(ScriptExtractor.createTempFileName('component.vue')).toBe('component.js');
      expect(ScriptExtractor.createTempFileName('path/to/component.vue')).toBe('path_to_component.js');
      expect(ScriptExtractor.createTempFileName('nested/path/Component.vue')).toBe('nested_path_Component.js');
    });

    it('should convert JavaScript file paths to JS temp file names', () => {
      expect(ScriptExtractor.createTempFileName('utils.js')).toBe('utils.js');
      expect(ScriptExtractor.createTempFileName('path/to/utils.js')).toBe('path_to_utils.js');
      expect(ScriptExtractor.createTempFileName('nested/path/Utils.js')).toBe('nested_path_Utils.js');
    });

    it('should handle Windows-style paths', () => {
      expect(ScriptExtractor.createTempFileName('path\\to\\file.vue')).toBe('path_to_file.js');
      expect(ScriptExtractor.createTempFileName('C:\\Users\\project\\component.vue')).toBe('C:_Users_project_component.js');
    });

    it('should handle Unix-style paths', () => {
      expect(ScriptExtractor.createTempFileName('path/to/file.vue')).toBe('path_to_file.js');
      expect(ScriptExtractor.createTempFileName('/home/user/project/component.vue')).toBe('_home_user_project_component.js');
    });
  });

  describe('validateExtractedScripts', () => {
    it('should return true when temp files are created', () => {
      const tempFiles = [
        { originalFile: '/test/component.vue', tempFile: '/temp/component.js' }
      ];

      const result = ScriptExtractor.validateExtractedScripts(tempFiles);
      expect(result).toBe(true);
    });

    it('should throw error when no temp files are created', () => {
      const tempFiles = [];

      expect(() => {
        ScriptExtractor.validateExtractedScripts(tempFiles);
      }).toThrow('No Vue files with script blocks or JavaScript files found to analyze.');
    });

    it('should handle undefined temp files', () => {
      expect(() => {
        ScriptExtractor.validateExtractedScripts(undefined);
      }).toThrow('Cannot read properties of undefined (reading \'length\')');
    });

    it('should handle null temp files', () => {
      expect(() => {
        ScriptExtractor.validateExtractedScripts(null);
      }).toThrow('Cannot read properties of null (reading \'length\')');
    });
  });
});
