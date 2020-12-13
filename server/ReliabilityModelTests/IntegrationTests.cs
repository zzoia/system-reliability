using System;
using System.Collections.Generic;
using System.Text;
using ReliabilityModel.Model;
using ReliabilityModel.Model.Enums;
using ReliabilityModel.Model.Formatters;
using ReliabilityModel.Model.Formatters.Filtering;
using ReliabilityModel.Model.System;
using Xunit;

namespace ReliabilityModel.Tests
{
    public class IntegrationTests
    {
        [Theory]
        [InlineData(true, "1 0,887 0,787 0,698 0,619 0,549 ")]
        [InlineData(false, "1 0,887 0,787 0,698 0,619 0,549 ")]
        public void GetProbability_ThreeModulesTwoParallelNoRecovery_Calculates(bool isTerminal, string expected)
        {
            static string PlotDataToString(IEnumerable<WorkingProbability> data)
            {
                var sb = new StringBuilder();
                foreach (WorkingProbability probability in data)
                    sb.Append(Math.Round(probability.AggregatedProbability, 3) + " ");
                return sb.ToString();
            }

            // Arrange
            var system = new MultipleModuleSystem(
                new List<Model.System.System>
                {
                    new SingleModuleSystem("I", 0)
                    {
                        FailureRate = 0.0001
                    },
                    new SingleModuleSystem("II", 0)
                    {
                        FailureRate = 0.0002
                    },
                    new SingleModuleSystem("III", 0) {FailureRate = 0.0003}
                }, ReliabilityDependency.And);


            // Act
            var sut = new SystemStateGraph(system, isTerminal);
            IReadOnlyList<WorkingProbability> actual = sut.GetProbability(0, 1000, 200);
            string stringFormat = PlotDataToString(actual);

            // Assert
            Assert.Equal(expected, stringFormat);
        }

        [Fact]
        public void SystemStateGraphCtor_ThreeModulesFirstOneRecovery_BuildsGraph()
        {
            // Arrange
            var system = new MultipleModuleSystem(
                new List<Model.System.System>
                {
                    new SingleModuleSystem("I", 1),
                    new SingleModuleSystem("II", null),
                    new SingleModuleSystem("III", null)
                }, ReliabilityDependency.And);
            const string expected = @"0 -> 1?, 2?, 4?
1? -> 0, 3?, 5?
2? -> 0, 3?, 6?
3? -> 1?, 2?, 7?
4? -> 5?, 6?, 8
5? -> 4?, 7?, 9?
6? -> 4?, 7?, 10?
7? -> 5?, 6?, 11?
8 -> 9?, 10?, 12!
9? -> 8, 11?, 13!
10? -> 8, 11?, 14!
11? -> 9?, 10?, 15!
12! -> 13!, 14!
13! -> 12!, 15!
14! -> 12!, 15!
15! -> 13!, 14!
";

            // Act
            var sut = new SystemStateGraph(system, true);
            var actual = new ShortGraphFormatter(new AllStatesFilteringStrategy()).ToString(sut);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        public void SystemStateGraphCtor_ThreeModulesFirstOneRecoveryReduced_BuildsGraph()
        {
            // Arrange
            var system = new MultipleModuleSystem(
                new List<Model.System.System>
                {
                    new SingleModuleSystem("I", 1),
                    new SingleModuleSystem("II", null),
                    new SingleModuleSystem("III", null)
                }, ReliabilityDependency.And);
            const string expected = @"0 -> 1?, 2?, 4?
1? -> 0, 3?, 5?
2? -> 0, 3?, 6?
3? -> 1?, 2?, 7?
4? -> 5?, 6?, 8
5? -> 4?, 7?, 9?
6? -> 4?, 7?, 10?
7? -> 5?, 6?, 11?
8 -> 9?, 10?, 12!
9? -> 8, 11?, 13!
10? -> 8, 11?, 14!
11? -> 9?, 10?, 15!
";

            // Act
            var sut = new SystemStateGraph(system, true);
            var actual = new ShortGraphFormatter(new NonTerminalStatesFilteringStrategy()).ToString(sut);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        public void SystemStateGraphCtor_ThreeModulesNoRecovery_BuildsGraph()
        {
            // Arrange
            var system = new MultipleModuleSystem(
                new List<Model.System.System>
                {
                    new SingleModuleSystem("I", 0),
                    new SingleModuleSystem("II", 0),
                    new SingleModuleSystem("III", 0)
                }, ReliabilityDependency.And);
            const string expected = @"0 -> 1!, 2!, 4!
1! -> 3!, 5!
2! -> 3!, 6!
3! -> 7!
4! -> 5!, 6!
5! -> 7!
6! -> 7!
7! -> 
";

            // Act
            var sut = new SystemStateGraph(system, true);
            var actual = new ShortGraphFormatter(new AllStatesFilteringStrategy()).ToString(sut);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Theory]
        [InlineData(true, @"-0,0006 0 0 0 0 0 0 0 
0,0003 -0,0003 0 0 0 0 0 0 
0,0002 0 -0,0004 0 0 0 0 0 
0 0,0002 0,0003 -0,0001 0 0 0 0 
0,0001 0 0 0 -0,0005 0 0 0 
0 0,0001 0 0 0,0003 -0,0002 0 0 
0 0 0,0001 0 0,0002 0 -0,0003 0 
0 0 0 0,0001 0 0,0002 0,0003 0 
")]
        [InlineData(false, @"-0,0006 0 0 0 0 0 0 
0,0003 -0,0003 0 0 0 0 0 
0,0002 0 -0,0004 0 0 0 0 
0 0,0002 0,0003 0 0 0 0 
0,0001 0 0 0 0 0 0 
0 0,0001 0 0 0 0 0 
0 0 0,0001 0 0 0 0 
")]
        public void SystemStateGraphCtor_ThreeModulesTwoParallelNoRecovery_BuildsWeightMatrix(bool includeTerminal,
            string expectedMatrix)
        {
            // Arrange
            var system = new MultipleModuleSystem(
                new List<Model.System.System>
                {
                    new SingleModuleSystem("I", 0)
                    {
                        FailureRate = 0.0001
                    },
                    new MultipleModuleSystem(new List<Model.System.System>
                    {
                        new SingleModuleSystem("II", 0)
                        {
                            FailureRate = 0.0002
                        },
                        new SingleModuleSystem("III", 0)
                        {
                            FailureRate = 0.0003
                        }
                    }, ReliabilityDependency.Or)
                }, ReliabilityDependency.And);
            var sut = new SystemStateGraph(system, includeTerminal);

            // Act
            double[,] weightMatrix = sut.BuildWeightMatrix();
            string weightMatrixString = MatrixToString(weightMatrix);

            // Assert
            Assert.Equal(expectedMatrix, weightMatrixString);
        }

        [Fact]
        public void SystemStateGraphCtor_ThreeModulesNoRecovery_BuildsWeightMatrix()
        {
            // Arrange
            var system = new MultipleModuleSystem(
                new List<Model.System.System>
                {
                    new SingleModuleSystem("I", 0)
                    {
                        FailureRate = 0.0001
                    },
                    new SingleModuleSystem("II", 0)
                    {
                        FailureRate = 0.0002
                    },
                    new SingleModuleSystem("III", 0)
                    {
                        FailureRate = 0.0003
                    }
                }, ReliabilityDependency.And);
            const string expectedMatrix = @"-0,0006 0 0 0 
0,0003 0 0 0 
0,0002 0 0 0 
0,0001 0 0 0 
";

            var sut = new SystemStateGraph(system, false);

            // Act
            double[,] weightMatrix = sut.BuildWeightMatrix();
            string weightMatrixString = MatrixToString(weightMatrix);

            // Assert
            Assert.Equal(expectedMatrix, weightMatrixString);
        }

        [Fact]
        public void SystemStateGraphCtor_ThreeModulesInfiniteRecovery_BuildsWeightMatrix()
        {
            // Arrange
            var system = new MultipleModuleSystem(
                new List<Model.System.System>
                {
                    new SingleModuleSystem("I", null)
                    {
                        FailureRate = 0.0001,
                        RecoveryRate = 0.03
                    },
                    new SingleModuleSystem("II", null)
                    {
                        FailureRate = 0.0002,
                        RecoveryRate = 0.04
                    },
                    new SingleModuleSystem("III", null)
                    {
                        FailureRate = 0.0003,
                        RecoveryRate = 0.05
                    }
                }, ReliabilityDependency.And);
            const string expected = @"-0,0006 0,05 0,04 0 0,03 0 0 0 
0,0003 -0,0503 0 0,04 0 0,03 0 0 
0,0002 0 -0,0404 0,05 0 0 0,03 0 
0 0,0002 0,0003 -0,0901 0 0 0 0,03 
0,0001 0 0 0 -0,0305 0,05 0,04 0 
0 0,0001 0 0 0,0003 -0,0802 0 0,04 
0 0 0,0001 0 0,0002 0 -0,0703 0,05 
0 0 0 0,0001 0 0,0002 0,0003 -0,12 
";
            var sut = new SystemStateGraph(system, true);

            // Act
            double[,] actual = sut.BuildWeightMatrix();
            string matrixString = MatrixToString(actual);

            // Assert
            Assert.Equal(expected, matrixString);
        }

        [Fact]
        public void SystemStateGraphCtor_ThreeModulesInfiniteRecovery_BuildsGraph()
        {
            // Arrange
            var system = new MultipleModuleSystem(
                new List<Model.System.System>
                {
                    new SingleModuleSystem("I", null),
                    new SingleModuleSystem("II", null),
                    new SingleModuleSystem("III", null)
                }, ReliabilityDependency.And);
            const string expected = @"0 -> 1?, 2?, 4?
1? -> 0, 3?, 5?
2? -> 0, 3?, 6?
3? -> 1?, 2?, 7?
4? -> 0, 5?, 6?
5? -> 1?, 4?, 7?
6? -> 2?, 4?, 7?
7? -> 3?, 5?, 6?
";

            // Act
            var sut = new SystemStateGraph(system, true);
            var actual = new ShortGraphFormatter(new AllStatesFilteringStrategy()).ToString(sut);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        public void SystemStateGraphCtor_SixModulesNoRecovery_BuildsGraph()
        {
            // Arrange
            var m1 = new SingleModuleSystem("I", 0);
            var m2 = new SingleModuleSystem("II", 0);
            var m3 = new SingleModuleSystem("III", 0);
            var m4 = new SingleModuleSystem("IV", 0);
            var m5 = new SingleModuleSystem("V", 0);
            var m6 = new SingleModuleSystem("VI", 0);

            var system = new MultipleModuleSystem(
                new List<Model.System.System>
                {
                    new MultipleModuleSystem(new List<Model.System.System> {m1, m2}, ReliabilityDependency.And),
                    new MultipleModuleSystem(new List<Model.System.System> {m3, m4}, ReliabilityDependency.And),
                    new MultipleModuleSystem(new List<Model.System.System> {m5, m6}, ReliabilityDependency.And)
                }, ReliabilityDependency.Or);

            const string expected = @"0 -> 1, 2, 4, 8, 16, 32
1 -> 3, 5, 9, 17, 33
2 -> 3, 6, 10, 18, 34
3 -> 7, 11, 19, 35
4 -> 5, 6, 12, 20, 36
5 -> 7, 13, 21!, 37!
6 -> 7, 14, 22!, 38!
7 -> 15, 23!, 39!
8 -> 9, 10, 12, 24, 40
9 -> 11, 13, 25!, 41!
10 -> 11, 14, 26!, 42!
11 -> 15, 27!, 43!
12 -> 13, 14, 28, 44
13 -> 15, 29!, 45!
14 -> 15, 30!, 46!
15 -> 31!, 47!
16 -> 17, 18, 20, 24, 48
17 -> 19, 21!, 25!, 49
18 -> 19, 22!, 26!, 50
19 -> 23!, 27!, 51
20 -> 21!, 22!, 28, 52
21! -> 23!, 29!, 53!
22! -> 23!, 30!, 54!
23! -> 31!, 55!
24 -> 25!, 26!, 28, 56
25! -> 27!, 29!, 57!
26! -> 27!, 30!, 58!
27! -> 31!, 59!
28 -> 29!, 30!, 60
29! -> 31!, 61!
30! -> 31!, 62!
31! -> 63!
32 -> 33, 34, 36, 40, 48
33 -> 35, 37!, 41!, 49
34 -> 35, 38!, 42!, 50
35 -> 39!, 43!, 51
36 -> 37!, 38!, 44, 52
37! -> 39!, 45!, 53!
38! -> 39!, 46!, 54!
39! -> 47!, 55!
40 -> 41!, 42!, 44, 56
41! -> 43!, 45!, 57!
42! -> 43!, 46!, 58!
43! -> 47!, 59!
44 -> 45!, 46!, 60
45! -> 47!, 61!
46! -> 47!, 62!
47! -> 63!
48 -> 49, 50, 52, 56
49 -> 51, 53!, 57!
50 -> 51, 54!, 58!
51 -> 55!, 59!
52 -> 53!, 54!, 60
53! -> 55!, 61!
54! -> 55!, 62!
55! -> 63!
56 -> 57!, 58!, 60
57! -> 59!, 61!
58! -> 59!, 62!
59! -> 63!
60 -> 61!, 62!
61! -> 63!
62! -> 63!
63! -> 
";

            // Act
            var sut = new SystemStateGraph(system, true);
            var actual = new ShortGraphFormatter(new AllStatesFilteringStrategy()).ToString(sut);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        public void SystemStateGraphCtor_SixModulesNoRecoveryReduced_BuildsGraph()
        {
            // Arrange
            var m1 = new SingleModuleSystem("I", 0);
            var m2 = new SingleModuleSystem("II", 0);
            var m3 = new SingleModuleSystem("III", 0);
            var m4 = new SingleModuleSystem("IV", 0);
            var m5 = new SingleModuleSystem("V", 0);
            var m6 = new SingleModuleSystem("VI", 0);

            var system = new MultipleModuleSystem(
                new List<Model.System.System>
                {
                    new MultipleModuleSystem(new List<Model.System.System> {m1, m2}, ReliabilityDependency.And),
                    new MultipleModuleSystem(new List<Model.System.System> {m3, m4}, ReliabilityDependency.And),
                    new MultipleModuleSystem(new List<Model.System.System> {m5, m6}, ReliabilityDependency.And)
                }, ReliabilityDependency.Or);

            const string expected = @"0 -> 1, 2, 4, 8, 16, 32
1 -> 3, 5, 9, 17, 33
2 -> 3, 6, 10, 18, 34
3 -> 7, 11, 19, 35
4 -> 5, 6, 12, 20, 36
5 -> 7, 13, 21!, 37!
6 -> 7, 14, 22!, 38!
7 -> 15, 23!, 39!
8 -> 9, 10, 12, 24, 40
9 -> 11, 13, 25!, 41!
10 -> 11, 14, 26!, 42!
11 -> 15, 27!, 43!
12 -> 13, 14, 28, 44
13 -> 15, 29!, 45!
14 -> 15, 30!, 46!
15 -> 31!, 47!
16 -> 17, 18, 20, 24, 48
17 -> 19, 21!, 25!, 49
18 -> 19, 22!, 26!, 50
19 -> 23!, 27!, 51
20 -> 21!, 22!, 28, 52
24 -> 25!, 26!, 28, 56
28 -> 29!, 30!, 60
32 -> 33, 34, 36, 40, 48
33 -> 35, 37!, 41!, 49
34 -> 35, 38!, 42!, 50
35 -> 39!, 43!, 51
36 -> 37!, 38!, 44, 52
40 -> 41!, 42!, 44, 56
44 -> 45!, 46!, 60
48 -> 49, 50, 52, 56
49 -> 51, 53!, 57!
50 -> 51, 54!, 58!
51 -> 55!, 59!
52 -> 53!, 54!, 60
56 -> 57!, 58!, 60
60 -> 61!, 62!
";

            // Act
            var sut = new SystemStateGraph(system, true);
            var actual = new ShortGraphFormatter(new NonTerminalStatesFilteringStrategy()).ToString(sut);

            // Assert
            Assert.Equal(expected, actual);
        }

        private static string MatrixToString(double[,] matrix)
        {
            var stringBuilder = new StringBuilder();
            for (var row = 0; row < matrix.GetLength(0); row++)
            {
                for (var col = 0; col < matrix.GetLength(1); col++)
                {
                    stringBuilder.Append(Math.Round(matrix[row, col], 4, MidpointRounding.AwayFromZero));
                    stringBuilder.Append(" ");
                }

                stringBuilder.AppendLine();
            }

            return stringBuilder.ToString();
        }
    }
}